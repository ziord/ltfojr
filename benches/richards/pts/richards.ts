// This is a JavaScript implementation of the Richards
// benchmark from:
//
//    http://www.cl.cam.ac.uk/~mr10/Bench.html
//
// The benchmark was originally implemented in BCPL by
// Martin Richards.


/**
 * The Richards benchmark simulates the task dispatcher of an
 * operating system.
 **/
function runRichards() {
    const scheduler = new Scheduler();
    scheduler.addIdleTask(ID_IDLE, 0, null, COUNT);
  
    let queue = new Packet(null, ID_WORKER, KIND_WORK);
    queue = new Packet(queue, ID_WORKER, KIND_WORK);
    scheduler.addWorkerTask(ID_WORKER, 1000, queue);
  
    queue = new Packet(null, ID_DEVICE_A, KIND_DEVICE);
    queue = new Packet(queue, ID_DEVICE_A, KIND_DEVICE);
    queue = new Packet(queue, ID_DEVICE_A, KIND_DEVICE);
    scheduler.addHandlerTask(ID_HANDLER_A, 2000, queue);
  
    queue = new Packet(null, ID_DEVICE_B, KIND_DEVICE);
    queue = new Packet(queue, ID_DEVICE_B, KIND_DEVICE);
    queue = new Packet(queue, ID_DEVICE_B, KIND_DEVICE);
    scheduler.addHandlerTask(ID_HANDLER_B, 3000, queue);
  
    scheduler.addDeviceTask(ID_DEVICE_A, 4000, null);
  
    scheduler.addDeviceTask(ID_DEVICE_B, 5000, null);
  
    scheduler.schedule();
  
    if (scheduler.queueCount !== EXPECTED_QUEUE_COUNT || scheduler.holdCount !== EXPECTED_HOLD_COUNT) {
      const msg = "Error during execution: queueCount = " + scheduler.queueCount + ", holdCount = " + scheduler.holdCount + ".";
      throw new Error(msg);
    }
}
  
const COUNT = 1000;

/**
 * These two constants specify how many times a packet is queued and
 * how many times a task is put on hold in a correct run of richards.
 * They don't have any meaning a such but are characteristic of a
 * correct run so if the actual queue or hold count is different from
 * the expected there must be a bug in the implementation.
 **/
const EXPECTED_QUEUE_COUNT = 2322;
const EXPECTED_HOLD_COUNT = 928;


/**
 * A scheduler can be used to schedule a set of tasks based on their relative
 * priorities.  Scheduling is done by maintaining a list of task control blocks
 * which holds tasks and the data queue they are processing.
 * @constructor
 */

type Task = IdleTask | HandlerTask | WorkerTask | DeviceTask;

class Scheduler {
  queueCount: number;
  holdCount: number;
  public readonly blocks: TaskControlBlock[] = new Array(NUMBER_OF_IDS);
  list: TaskControlBlock | null;
  currentTcb: TaskControlBlock | null;
  currentId: number | null;

  constructor() {
    this.queueCount = 0;
    this.holdCount = 0;
    this.list = null;
    this.currentTcb = null;
    this.currentId = null;
  }

  addIdleTask(id: number, priority: number, queue: Packet | null, count: number): void {
    this.addRunningTask(id, priority, queue, new IdleTask(this, 1, count));
  }

  addWorkerTask(id: number, priority: number, queue: Packet | null): void {
    this.addTask(id, priority, queue, new WorkerTask(this, ID_HANDLER_A, 0));
  }

  addHandlerTask(id: number, priority: number, queue: Packet | null): void {
    this.addTask(id, priority, queue, new HandlerTask(this));
  }

  addDeviceTask(id: number, priority: number, queue: Packet | null): void {
    this.addTask(id, priority, queue, new DeviceTask(this));
  }

  addRunningTask(id: number, priority: number, queue: Packet | null, task: Task): void {
    this.addTask(id, priority, queue, task);
    if (this.currentTcb) this.currentTcb.setRunning();
  }

  addTask(id: number, priority: number, queue: Packet | null, task: Task): void {
    this.currentTcb = new TaskControlBlock(this.list, id, priority, queue, task);
    this.list = this.currentTcb;
    this.blocks[id] = this.currentTcb;
  }

  schedule(): void {
    this.currentTcb = this.list;
    while (this.currentTcb !== null) {
      if (this.currentTcb.isHeldOrSuspended()) {
        this.currentTcb = this.currentTcb.link;
      } else {
        this.currentId = this.currentTcb.id;
        this.currentTcb = this.currentTcb.run();
      }
    }
  }

  release(id: number): TaskControlBlock | null {
    const tcb = this.blocks[id];
    if (tcb === null) return tcb;
    tcb.markAsNotHeld();
    if (tcb.priority > this.currentTcb!.priority) {
      return tcb;
    } else {
      return this.currentTcb;
    }
  }

  holdCurrent(): TaskControlBlock | null {
    this.holdCount++;
    if (this.currentTcb) this.currentTcb.markAsHeld();
    return this.currentTcb!.link;
  }

  suspendCurrent(): TaskControlBlock | null {
    if (this.currentTcb) this.currentTcb.markAsSuspended();
    return this.currentTcb;
  }

  queue(packet: Packet): TaskControlBlock | null {
    const t = this.blocks[packet.id];
    if (t === null) return t;
    this.queueCount++;
    packet.link = null;
    packet.id = this.currentId ?? 0;
    return t.checkPriorityAdd(this.currentTcb!, packet);
  }
}

const ID_IDLE = 0;
const ID_WORKER = 1;
const ID_HANDLER_A = 2;
const ID_HANDLER_B = 3;
const ID_DEVICE_A = 4;
const ID_DEVICE_B = 5;
const NUMBER_OF_IDS = 6;

const KIND_DEVICE = 0;
const KIND_WORK = 1;

const STATE_RUNNING = 0;
const STATE_RUNNABLE = 1;
const STATE_SUSPENDED = 2;
const STATE_HELD = 4;

const STATE_SUSPENDED_RUNNABLE = STATE_SUSPENDED | STATE_RUNNABLE;
const STATE_NOT_HELD = ~STATE_HELD;

const DATA_SIZE = 4;

class Packet {
  link: Packet | null;
  id: number;
  a1: number;
  public readonly a2 = new Array(DATA_SIZE);

  constructor(link: Packet | null, id: number, public readonly kind: number) {
    this.link = link;
    this.id = id;
    this.a1 = 0;
  }

  addTo(queue: Packet | null): Packet {
    this.link = null;
    if (queue == null) return this;
    let peek: Packet | null, next: Packet | null = queue;
    while ((peek = next.link) != null) next = peek;
    next.link = this;
    return queue;
  }

  toString(): string {
    return "Packet";
  }
}

class TaskControlBlock {
  state: number;

  constructor(
    public link: TaskControlBlock | null,
    public id: number,
    public readonly priority: number,
    public queue: Packet | null,
    public readonly task: Task
  ) {
    if (queue == null) {
      this.state = STATE_SUSPENDED;
    } else {
      this.state = STATE_SUSPENDED_RUNNABLE;
    }
  }

  setRunning(): void {
    this.state = STATE_RUNNING;
  }

  markAsNotHeld(): void {
    this.state = this.state & STATE_NOT_HELD;
  }

  markAsHeld(): void {
    this.state = this.state | STATE_HELD;
  }

  isHeldOrSuspended(): boolean {
    return (this.state & STATE_HELD) !== 0 || this.state === STATE_SUSPENDED;
  }

  markAsSuspended(): void {
    this.state = this.state | STATE_SUSPENDED;
  }

  markAsRunnable(): void {
    this.state = this.state | STATE_RUNNABLE;
  }

  run(): TaskControlBlock | null {
    let packet: Packet | null;
    if (this.state === STATE_SUSPENDED_RUNNABLE) {
      packet = this.queue;
      this.queue = packet!.link;
      if (this.queue === null) {
        this.state = STATE_RUNNING;
      } else {
        this.state = STATE_RUNNABLE;
      }
    } else {
      packet = null;
    }
    return this.task.run(packet);
  }

  checkPriorityAdd(task: TaskControlBlock, packet: Packet): TaskControlBlock {
    if (this.queue === null) {
      this.queue = packet;
      this.markAsRunnable();
      if (this.priority > task.priority) return this;
    } else {
      this.queue = packet.addTo(this.queue);
    }
    return task;
  }

  toString(): string {
    return "tcb { " + this.task + "@" + this.state + " }";
  }
}

class IdleTask {
  scheduler: Scheduler;
  v1: number;
  count: number;

  constructor(scheduler: Scheduler, v1: number, count: number) {
    this.scheduler = scheduler;
    this.v1 = v1;
    this.count = count;
  }

  run(packet: Packet | null): TaskControlBlock | null {
    this.count--;
    if (this.count === 0) return this.scheduler.holdCurrent();
    if ((this.v1 & 1) === 0) {
      this.v1 = this.v1 >> 1;
      return this.scheduler.release(ID_DEVICE_A);
    } else {
      this.v1 = (this.v1 >> 1) ^ 0xD008;
      return this.scheduler.release(ID_DEVICE_B);
    }
  }

  toString(): string {
    return "IdleTask";
  }
}

class DeviceTask {
  scheduler: Scheduler;
  v1: Packet | null;

  constructor(scheduler: Scheduler) {
    this.scheduler = scheduler;
    this.v1 = null;
  }

  run(packet: Packet | null): TaskControlBlock | null {
    if (packet === null) {
      if (this.v1 === null) return this.scheduler.suspendCurrent();
      const v = this.v1;
      this.v1 = null;
      return this.scheduler.queue(v);
    } else {
      this.v1 = packet;
      return this.scheduler.holdCurrent();
    }
  }

  toString(): string {
    return "DeviceTask";
  }
}

class WorkerTask {

  constructor(public readonly scheduler: Scheduler, public v1: number, public v2: number) {}

  run(packet: Packet | null): TaskControlBlock | null {
    if (packet === null) {
      return this.scheduler.suspendCurrent();
    } else {
      if (this.v1 === ID_HANDLER_A) {
        this.v1 = ID_HANDLER_B;
      } else {
        this.v1 = ID_HANDLER_A;
      }
      packet.id = this.v1;
      packet.a1 = 0;
      for (let i = 0; i < DATA_SIZE; i++) {
        this.v2++;
        if (this.v2 > 26) this.v2 = 1;
        packet.a2[i] = this.v2;
      }
      return this.scheduler.queue(packet);
    }
  }

  toString(): string {
    return "WorkerTask";
  }
}

class HandlerTask {
  v1: Packet | null;
  v2: Packet | null;

  constructor(public readonly scheduler: Scheduler) {
    this.v1 = null;
    this.v2 = null;
  }

  run(packet: Packet | null): TaskControlBlock | null {
    if (packet !== null) {
      if (packet.kind === KIND_WORK) {
        this.v1 = packet.addTo(this.v1);
      } else {
        this.v2 = packet.addTo(this.v2);
      }
    }
    if (this.v1 !== null) {
      const count = this.v1.a1;
      let v: Packet | null;
      if (count < DATA_SIZE) {
        if (this.v2 !== null) {
          v = this.v2;
          this.v2 = this.v2.link;
          v.a1 = this.v1.a2[count];
          this.v1.a1 = count + 1;
          return this.scheduler.queue(v);
        }
      } else {
        v = this.v1;
        this.v1 = this.v1.link;
        return this.scheduler.queue(v);
      }
    }
    return this.scheduler.suspendCurrent();
  }

  toString(): string {
    return "HandlerTask";
  }
}

function runIteration() {
  for (let i = 0; i < 50; ++i) runRichards();
}

runIteration();
