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
    if ($__getByIdOffset(scheduler, "queueCount", 0) !== EXPECTED_QUEUE_COUNT || $__getByIdOffset(scheduler, "holdCount", 1) !== EXPECTED_HOLD_COUNT) {
        const msg = "Error during execution: queueCount = " + $__getByIdOffset(scheduler, "queueCount", 0) + ", holdCount = " + $__getByIdOffset(scheduler, "holdCount", 1) + ".";
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
        $__putByIdDirect(this, "queueCount", void 0);
        $__putByIdDirect(this, "holdCount", void 1);
        $__putByIdDirect(this, "blocks", void 2);
        $__putByIdDirect(this, "list", void 3);
        $__putByIdDirect(this, "currentTcb", void 4);
        $__putByIdDirect(this, "currentId", void 5);
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
        if ($__getByIdOffset(this, "currentTcb", 4))
            $__getByIdOffset(this, "currentTcb", 4).setRunning();
    }
    addTask(id, priority, queue, task) {
        this.currentTcb = new TaskControlBlock($__getByIdOffset(this, "list", 3), id, priority, queue, task);
        this.list = $__getByIdOffset(this, "currentTcb", 4);
        $__getByIdOffset(this, "blocks", 2)[id] = $__getByIdOffset(this, "currentTcb", 4);
    }
    schedule() {
        this.currentTcb = $__getByIdOffset(this, "list", 3);
        while ($__getByIdOffset(this, "currentTcb", 4) !== null) {
            if ($__getByIdOffset(this, "currentTcb", 4).isHeldOrSuspended()) {
                this.currentTcb = $__getByIdOffset($__getByIdOffset(this, "currentTcb", 4), "link", 1);
            }
            else {
                this.currentId = $__getByIdOffset($__getByIdOffset(this, "currentTcb", 4), "id", 2);
                this.currentTcb = $__getByIdOffset(this, "currentTcb", 4).run();
            }
        }
    }
    release(id) {
        const tcb = $__getByIdOffset(this, "blocks", 2)[id];
        if (tcb === null)
            return tcb;
        tcb.markAsNotHeld();
        if ($__getByIdOffset(tcb, "priority", 3) > $__getByIdOffset(this, "currentTcb", 4).priority) {
            return tcb;
        }
        else {
            return $__getByIdOffset(this, "currentTcb", 4);
        }
    }
    holdCurrent() {
        this.holdCount++;
        if ($__getByIdOffset(this, "currentTcb", 4))
            $__getByIdOffset(this, "currentTcb", 4).markAsHeld();
        return $__getByIdOffset(this, "currentTcb", 4).link;
    }
    suspendCurrent() {
        if ($__getByIdOffset(this, "currentTcb", 4))
            $__getByIdOffset(this, "currentTcb", 4).markAsSuspended();
        return $__getByIdOffset(this, "currentTcb", 4);
    }
    queue(packet) {
        var _a;
        const t = $__getByIdOffset(this, "blocks", 2)[$__getByIdOffset(packet, "id", 1)];
        if (t === null)
            return t;
        this.queueCount++;
        packet.link = null;
        packet.id = (_a = $__getByIdOffset(this, "currentId", 5)) !== null && _a !== void 0 ? _a : 0;
        return t.checkPriorityAdd($__getByIdOffset(this, "currentTcb", 4), packet);
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
        $__putByIdDirect(this, "link", void 0);
        $__putByIdDirect(this, "id", void 1);
        $__putByIdDirect(this, "a1", void 2);
        $__putByIdDirect(this, "a2", void 3);
        $__putByIdDirect(this, "kind", void 4);
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
        while ((peek = $__getByIdOffset(next, "link", 0)) != null)
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
        $__putByIdDirect(this, "state", void 0);
        $__putByIdDirect(this, "link", void 1);
        $__putByIdDirect(this, "id", void 2);
        $__putByIdDirect(this, "priority", void 3);
        $__putByIdDirect(this, "queue", void 4);
        $__putByIdDirect(this, "task", void 5);
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
        this.state = $__getByIdOffset(this, "state", 0) & STATE_NOT_HELD;
    }
    markAsHeld() {
        this.state = $__getByIdOffset(this, "state", 0) | STATE_HELD;
    }
    isHeldOrSuspended() {
        return ($__getByIdOffset(this, "state", 0) & STATE_HELD) !== 0 || $__getByIdOffset(this, "state", 0) === STATE_SUSPENDED;
    }
    markAsSuspended() {
        this.state = $__getByIdOffset(this, "state", 0) | STATE_SUSPENDED;
    }
    markAsRunnable() {
        this.state = $__getByIdOffset(this, "state", 0) | STATE_RUNNABLE;
    }
    run() {
        let packet;
        if ($__getByIdOffset(this, "state", 0) === STATE_SUSPENDED_RUNNABLE) {
            packet = $__getByIdOffset(this, "queue", 4);
            this.queue = packet.link;
            if ($__getByIdOffset(this, "queue", 4) === null) {
                this.state = STATE_RUNNING;
            }
            else {
                this.state = STATE_RUNNABLE;
            }
        }
        else {
            packet = null;
        }
        return $__getByIdOffset(this, "task", 5).run(packet);
    }
    checkPriorityAdd(task, packet) {
        if ($__getByIdOffset(this, "queue", 4) === null) {
            this.queue = packet;
            this.markAsRunnable();
            if ($__getByIdOffset(this, "priority", 3) > $__getByIdOffset(task, "priority", 3))
                return this;
        }
        else {
            this.queue = packet.addTo($__getByIdOffset(this, "queue", 4));
        }
        return task;
    }
    toString() {
        return "tcb { " + $__getByIdOffset(this, "task", 5) + "@" + $__getByIdOffset(this, "state", 0) + " }";
    }
}
class IdleTask {
    constructor(scheduler, v1, count) {
        $__putByIdDirect(this, "scheduler", void 0);
        $__putByIdDirect(this, "v1", void 1);
        $__putByIdDirect(this, "count", void 2);
        this.scheduler = scheduler;
        this.v1 = v1;
        this.count = count;
    }
    run(packet) {
        this.count--;
        if ($__getByIdOffset(this, "count", 2) === 0)
            return $__getByIdOffset(this, "scheduler", 0).holdCurrent();
        if (($__getByIdOffset(this, "v1", 1) & 1) === 0) {
            this.v1 = $__getByIdOffset(this, "v1", 1) >> 1;
            return $__getByIdOffset(this, "scheduler", 0).release(ID_DEVICE_A);
        }
        else {
            this.v1 = ($__getByIdOffset(this, "v1", 1) >> 1) ^ 0xD008;
            return $__getByIdOffset(this, "scheduler", 0).release(ID_DEVICE_B);
        }
    }
    toString() {
        return "IdleTask";
    }
}
class DeviceTask {
    constructor(scheduler) {
        $__putByIdDirect(this, "scheduler", void 0);
        $__putByIdDirect(this, "v1", void 1);
        this.scheduler = scheduler;
        this.v1 = null;
    }
    run(packet) {
        if (packet === null) {
            if ($__getByIdOffset(this, "v1", 1) === null)
                return $__getByIdOffset(this, "scheduler", 0).suspendCurrent();
            const v = $__getByIdOffset(this, "v1", 1);
            this.v1 = null;
            return $__getByIdOffset(this, "scheduler", 0).queue(v);
        }
        else {
            this.v1 = packet;
            return $__getByIdOffset(this, "scheduler", 0).holdCurrent();
        }
    }
    toString() {
        return "DeviceTask";
    }
}
class WorkerTask {
    constructor(scheduler, v1, v2) {
        $__putByIdDirect(this, "scheduler", void 0);
        $__putByIdDirect(this, "v1", void 1);
        $__putByIdDirect(this, "v2", void 2);
        this.scheduler = scheduler;
        this.v1 = v1;
        this.v2 = v2;
    }
    run(packet) {
        if (packet === null) {
            return $__getByIdOffset(this, "scheduler", 0).suspendCurrent();
        }
        else {
            if ($__getByIdOffset(this, "v1", 1) === ID_HANDLER_A) {
                this.v1 = ID_HANDLER_B;
            }
            else {
                this.v1 = ID_HANDLER_A;
            }
            packet.id = $__getByIdOffset(this, "v1", 1);
            packet.a1 = 0;
            for (let i = 0; i < DATA_SIZE; i++) {
                this.v2++;
                if ($__getByIdOffset(this, "v2", 2) > 26)
                    this.v2 = 1;
                $__getByIdOffset(packet, "a2", 3)[i] = $__getByIdOffset(this, "v2", 2);
            }
            return $__getByIdOffset(this, "scheduler", 0).queue(packet);
        }
    }
    toString() {
        return "WorkerTask";
    }
}
class HandlerTask {
    constructor(scheduler) {
        $__putByIdDirect(this, "v1", void 0);
        $__putByIdDirect(this, "v2", void 1);
        $__putByIdDirect(this, "scheduler", void 2);
        this.scheduler = scheduler;
        this.v1 = null;
        this.v2 = null;
    }
    run(packet) {
        if (packet !== null) {
            if ($__getByIdOffset(packet, "kind", 4) === KIND_WORK) {
                this.v1 = packet.addTo($__getByIdOffset(this, "v1", 0));
            }
            else {
                this.v2 = packet.addTo($__getByIdOffset(this, "v2", 1));
            }
        }
        if ($__getByIdOffset(this, "v1", 0) !== null) {
            const count = $__getByIdOffset($__getByIdOffset(this, "v1", 0), "a1", 2);
            let v;
            if (count < DATA_SIZE) {
                if ($__getByIdOffset(this, "v2", 1) !== null) {
                    v = $__getByIdOffset(this, "v2", 1);
                    this.v2 = $__getByIdOffset($__getByIdOffset(this, "v2", 1), "link", 0);
                    v.a1 = $__getByIdOffset($__getByIdOffset(this, "v1", 0), "a2", 3)[count];
                    $__getByIdOffset(this, "v1", 0).a1 = count + 1;
                    return $__getByIdOffset(this, "scheduler", 2).queue(v);
                }
            }
            else {
                v = $__getByIdOffset(this, "v1", 0);
                this.v1 = $__getByIdOffset($__getByIdOffset(this, "v1", 0), "link", 0);
                return $__getByIdOffset(this, "scheduler", 2).queue(v);
            }
        }
        return $__getByIdOffset(this, "scheduler", 2).suspendCurrent();
    }
    toString() {
        return "HandlerTask";
    }
}
function runIteration() {
    for (let i = 0; i < 100; ++i)
        runRichards();
}
runIteration();
