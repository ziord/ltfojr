"use strict";
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
class Scheduler {
    constructor() {
        this.blocks = new Array(NUMBER_OF_IDS);
        this.queueCount = 0;
        this.holdCount = 0;
        this.list = null;
        this.currentTcb = null;
        this.currentId = null;
    }
    addIdleTask(id, priority, queue, count) {
        this.addRunningTask(id, priority, queue, new IdleTask(this, 1, count));
    }
    addWorkerTask(id, priority, queue) {
        this.addTask(id, priority, queue, new WorkerTask(this, ID_HANDLER_A, 0));
    }
    addHandlerTask(id, priority, queue) {
        this.addTask(id, priority, queue, new HandlerTask(this));
    }
    addDeviceTask(id, priority, queue) {
        this.addTask(id, priority, queue, new DeviceTask(this));
    }
    addRunningTask(id, priority, queue, task) {
        this.addTask(id, priority, queue, task);
        if (this.currentTcb)
            this.currentTcb.setRunning();
    }
    addTask(id, priority, queue, task) {
        this.currentTcb = new TaskControlBlock(this.list, id, priority, queue, task);
        this.list = this.currentTcb;
        this.blocks[id] = this.currentTcb;
    }
    schedule() {
        this.currentTcb = this.list;
        while (this.currentTcb !== null) {
            if (this.currentTcb.isHeldOrSuspended()) {
                this.currentTcb = this.currentTcb.link;
            }
            else {
                this.currentId = this.currentTcb.id;
                this.currentTcb = this.currentTcb.run();
            }
        }
    }
    release(id) {
        const tcb = this.blocks[id];
        if (tcb === null)
            return tcb;
        tcb.markAsNotHeld();
        if (tcb.priority > this.currentTcb.priority) {
            return tcb;
        }
        else {
            return this.currentTcb;
        }
    }
    holdCurrent() {
        this.holdCount++;
        if (this.currentTcb)
            this.currentTcb.markAsHeld();
        return this.currentTcb.link;
    }
    suspendCurrent() {
        if (this.currentTcb)
            this.currentTcb.markAsSuspended();
        return this.currentTcb;
    }
    queue(packet) {
        var _a;
        const t = this.blocks[packet.id];
        if (t === null)
            return t;
        this.queueCount++;
        packet.link = null;
        packet.id = (_a = this.currentId) !== null && _a !== void 0 ? _a : 0;
        return t.checkPriorityAdd(this.currentTcb, packet);
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
    constructor(link, id, kind) {
        this.kind = kind;
        this.a2 = new Array(DATA_SIZE);
        this.link = link;
        this.id = id;
        this.a1 = 0;
    }
    addTo(queue) {
        this.link = null;
        if (queue == null)
            return this;
        let peek, next = queue;
        while ((peek = next.link) != null)
            next = peek;
        next.link = this;
        return queue;
    }
    toString() {
        return "Packet";
    }
}
class TaskControlBlock {
    constructor(link, id, priority, queue, task) {
        this.link = link;
        this.id = id;
        this.priority = priority;
        this.queue = queue;
        this.task = task;
        if (queue == null) {
            this.state = STATE_SUSPENDED;
        }
        else {
            this.state = STATE_SUSPENDED_RUNNABLE;
        }
    }
    setRunning() {
        this.state = STATE_RUNNING;
    }
    markAsNotHeld() {
        this.state = this.state & STATE_NOT_HELD;
    }
    markAsHeld() {
        this.state = this.state | STATE_HELD;
    }
    isHeldOrSuspended() {
        return (this.state & STATE_HELD) !== 0 || this.state === STATE_SUSPENDED;
    }
    markAsSuspended() {
        this.state = this.state | STATE_SUSPENDED;
    }
    markAsRunnable() {
        this.state = this.state | STATE_RUNNABLE;
    }
    run() {
        let packet;
        if (this.state === STATE_SUSPENDED_RUNNABLE) {
            packet = this.queue;
            this.queue = packet.link;
            if (this.queue === null) {
                this.state = STATE_RUNNING;
            }
            else {
                this.state = STATE_RUNNABLE;
            }
        }
        else {
            packet = null;
        }
        return this.task.run(packet);
    }
    checkPriorityAdd(task, packet) {
        if (this.queue === null) {
            this.queue = packet;
            this.markAsRunnable();
            if (this.priority > task.priority)
                return this;
        }
        else {
            this.queue = packet.addTo(this.queue);
        }
        return task;
    }
    toString() {
        return "tcb { " + this.task + "@" + this.state + " }";
    }
}
class IdleTask {
    constructor(scheduler, v1, count) {
        this.scheduler = scheduler;
        this.v1 = v1;
        this.count = count;
    }
    run(packet) {
        this.count--;
        if (this.count === 0)
            return this.scheduler.holdCurrent();
        if ((this.v1 & 1) === 0) {
            this.v1 = this.v1 >> 1;
            return this.scheduler.release(ID_DEVICE_A);
        }
        else {
            this.v1 = (this.v1 >> 1) ^ 0xD008;
            return this.scheduler.release(ID_DEVICE_B);
        }
    }
    toString() {
        return "IdleTask";
    }
}
class DeviceTask {
    constructor(scheduler) {
        this.scheduler = scheduler;
        this.v1 = null;
    }
    run(packet) {
        if (packet === null) {
            if (this.v1 === null)
                return this.scheduler.suspendCurrent();
            const v = this.v1;
            this.v1 = null;
            return this.scheduler.queue(v);
        }
        else {
            this.v1 = packet;
            return this.scheduler.holdCurrent();
        }
    }
    toString() {
        return "DeviceTask";
    }
}
class WorkerTask {
    constructor(scheduler, v1, v2) {
        this.scheduler = scheduler;
        this.v1 = v1;
        this.v2 = v2;
    }
    run(packet) {
        if (packet === null) {
            return this.scheduler.suspendCurrent();
        }
        else {
            if (this.v1 === ID_HANDLER_A) {
                this.v1 = ID_HANDLER_B;
            }
            else {
                this.v1 = ID_HANDLER_A;
            }
            packet.id = this.v1;
            packet.a1 = 0;
            for (let i = 0; i < DATA_SIZE; i++) {
                this.v2++;
                if (this.v2 > 26)
                    this.v2 = 1;
                packet.a2[i] = this.v2;
            }
            return this.scheduler.queue(packet);
        }
    }
    toString() {
        return "WorkerTask";
    }
}
class HandlerTask {
    constructor(scheduler) {
        this.scheduler = scheduler;
        this.v1 = null;
        this.v2 = null;
    }
    run(packet) {
        if (packet !== null) {
            if (packet.kind === KIND_WORK) {
                this.v1 = packet.addTo(this.v1);
            }
            else {
                this.v2 = packet.addTo(this.v2);
            }
        }
        if (this.v1 !== null) {
            const count = this.v1.a1;
            let v;
            if (count < DATA_SIZE) {
                if (this.v2 !== null) {
                    v = this.v2;
                    this.v2 = this.v2.link;
                    v.a1 = this.v1.a2[count];
                    this.v1.a1 = count + 1;
                    return this.scheduler.queue(v);
                }
            }
            else {
                v = this.v1;
                this.v1 = this.v1.link;
                return this.scheduler.queue(v);
            }
        }
        return this.scheduler.suspendCurrent();
    }
    toString() {
        return "HandlerTask";
    }
}
function runIteration() {
    for (let i = 0; i < 50; ++i)
        runRichards();
}
runIteration();
