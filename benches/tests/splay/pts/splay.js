"use strict";
const kSplayTreeSize = 8000;
const kSplayTreeModifications = 80;
const kSplayTreePayloadDepth = 5;
let splayTree = null;
let splaySampleTimeStart = 0.0;
function GeneratePayloadTree(depth, tag) {
    if (depth === 0) {
        return {
            array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            string: `String for key ${tag} in leaf node`
        };
    }
    else {
        return {
            left: GeneratePayloadTree(depth - 1, tag),
            right: GeneratePayloadTree(depth - 1, tag)
        };
    }
}
function GenerateKey() {
    // The benchmark framework guarantees that Math.random is
    // deterministic; see base.js.
    return Math.random();
}
var splaySamples = [];
function SplayLatency() {
    return splaySamples;
}
function SplayUpdateStats(time) {
    const pause = time - splaySampleTimeStart;
    splaySampleTimeStart = time;
    splaySamples.push(pause);
}
function InsertNewNode() {
    // Insert new node with a unique key.
    let key;
    do {
        key = GenerateKey();
    } while (splayTree.find(key) !== null);
    const payload = GeneratePayloadTree(kSplayTreePayloadDepth, String(key));
    splayTree.insert(key, payload);
    return key;
}
function SplaySetup() {
    // Check if the platform has the performance.now high resolution timer.
    // If not, throw exception and quit.
    if (!performance.now) {
        throw new Error("PerformanceNowUnsupported");
    }
    splayTree = new SplayTree();
    splaySampleTimeStart = performance.now();
    for (let i = 0; i < kSplayTreeSize; i++) {
        InsertNewNode();
        if ((i + 1) % 20 === 19) {
            SplayUpdateStats(performance.now());
        }
    }
}
function SplayTearDown() {
    // Allow the garbage collector to reclaim the memory
    // used by the splay tree no matter how we exit the
    // tear down function.
    const keys = splayTree.exportKeys();
    splayTree = null;
    splaySamples = [];
    // Verify that the splay tree has the right size.
    const length = keys.length;
    if (length !== kSplayTreeSize) {
        throw new Error("Splay tree has wrong size");
    }
    // Verify that the splay tree has sorted, unique keys.
    for (let i = 0; i < length - 1; i++) {
        if (keys[i] >= keys[i + 1]) {
            throw new Error("Splay tree not sorted");
        }
    }
}
function SplayRun() {
    // Replace a few nodes in the splay tree.
    for (let i = 0; i < kSplayTreeModifications; i++) {
        const key = InsertNewNode();
        const greatest = splayTree.findGreatestLessThan(key);
        if (greatest === null)
            splayTree.remove(key);
        else
            splayTree.remove($__getByIdOffset(greatest, "key", 0));
    }
    SplayUpdateStats(performance.now());
}
class SplayNode {
    constructor(key, value, left = null, right = null) {
        this.key = key;
        this.value = value;
        this.left = left;
        this.right = right;
    }
    traverse_(f) {
        var current = this;
        while (current) {
            var left = $__getByIdOffset(current, "left", 2);
            if (left)
                left.traverse_(f);
            f(current);
            current = $__getByIdOffset(current, "right", 3);
        }
    }
}
class SplayTree {
    constructor() {
        this.root_ = null;
    }
    isEmpty() {
        return !$__getByIdOffset(this, "root_", 0);
    }
    insert(key, value) {
        if (this.isEmpty()) {
            this.root_ = new SplayNode(key, value);
            return;
        }
        // Splay on the key to move the last node on the search path for
        // the key to the root of the tree.
        this.splay_(key);
        if ($__getByIdOffset(this, "root_", 0).key === key) {
            return;
        }
        const node = new SplayNode(key, value);
        if (key > $__getByIdOffset(this, "root_", 0).key) {
            node.left = $__getByIdOffset(this, "root_", 0);
            node.right = $__getByIdOffset(this, "root_", 0).right;
            $__getByIdOffset(this, "root_", 0).right = null;
        }
        else {
            node.right = $__getByIdOffset(this, "root_", 0);
            node.left = $__getByIdOffset(this, "root_", 0).left;
            $__getByIdOffset(this, "root_", 0).left = null;
        }
        this.root_ = node;
    }
    remove(key) {
        if (this.isEmpty()) {
            throw new Error('Key not found: ' + key);
        }
        this.splay_(key);
        if ($__getByIdOffset(this, "root_", 0).key !== key) {
            throw new Error('Key not found: ' + key);
        }
        let removed = $__getByIdOffset(this, "root_", 0);
        if (!$__getByIdOffset(this, "root_", 0).left) {
            this.root_ = $__getByIdOffset(this, "root_", 0).right;
        }
        else {
            const right = $__getByIdOffset(this, "root_", 0).right;
            this.root_ = $__getByIdOffset(this, "root_", 0).left;
            // Splay to make sure that the new root has an empty right child.
            this.splay_(key);
            // Insert the original right child as the right child of the new
            // root.
            $__getByIdOffset(this, "root_", 0).right = right;
        }
        return removed;
    }
    find(key) {
        if (this.isEmpty()) {
            return null;
        }
        this.splay_(key);
        return $__getByIdOffset(this, "root_", 0).key === key ? $__getByIdOffset(this, "root_", 0) : null;
    }
    findMax(opt_startNode) {
        if (this.isEmpty()) {
            return null;
        }
        let current = opt_startNode || $__getByIdOffset(this, "root_", 0);
        while (current.right) {
            current = current.right;
        }
        return current;
    }
    findGreatestLessThan(key) {
        if (this.isEmpty()) {
            return null;
        }
        // Splay on the key to move the node with the given key or the last
        // node on the search path to the top of the tree.
        this.splay_(key);
        // Now the result is either the root node or the greatest node in
        // the left subtree.
        if ($__getByIdOffset(this, "root_", 0).key < key) {
            return $__getByIdOffset(this, "root_", 0);
        }
        else if ($__getByIdOffset(this, "root_", 0).left) {
            return this.findMax($__getByIdOffset(this, "root_", 0).left);
        }
        else {
            return null;
        }
    }
    exportKeys() {
        const result = [];
        if (!this.isEmpty()) {
            $__getByIdOffset(this, "root_", 0).traverse_(node => {
                if (node)
                    result.push($__getByIdOffset(node, "key", 0));
            });
        }
        return result;
    }
    splay_(key) {
        if (this.isEmpty()) {
            return;
        }
        // Create a dummy node.  The use of the dummy node is a bit
        // counter-intuitive: The right child of the dummy node will hold
        // the L tree of the algorithm.  The left child of the dummy node
        // will hold the R tree of the algorithm.  Using a dummy node, left
        // and right will always be nodes and we avoid special cases.
        let dummy, left, right;
        dummy = left = right = new SplayNode(null, null);
        let current = $__getByIdOffset(this, "root_", 0);
        while (true) {
            if (key < $__getByIdOffset(current, "key", 0)) {
                if (!$__getByIdOffset(current, "left", 2)) {
                    break;
                }
                if (key < $__getByIdOffset($__getByIdOffset(current, "left", 2), "key", 0)) {
                    // Rotate right.
                    const tmp = $__getByIdOffset(current, "left", 2);
                    current.left = $__getByIdOffset(tmp, "right", 3);
                    tmp.right = current;
                    current = tmp;
                    if (!$__getByIdOffset(current, "left", 2)) {
                        break;
                    }
                }
                // Link right.
                right.left = current;
                right = current;
                current = $__getByIdOffset(current, "left", 2);
            }
            else if (key > $__getByIdOffset(current, "key", 0)) {
                if (!$__getByIdOffset(current, "right", 3)) {
                    break;
                }
                if (key > $__getByIdOffset($__getByIdOffset(current, "right", 3), "key", 0)) {
                    // Rotate left.
                    const tmp = $__getByIdOffset(current, "right", 3);
                    current.right = $__getByIdOffset(tmp, "left", 2);
                    tmp.left = current;
                    current = tmp;
                    if (!$__getByIdOffset(current, "right", 3)) {
                        break;
                    }
                }
                // Link left.
                left.right = current;
                left = current;
                current = $__getByIdOffset(current, "right", 3);
            }
            else {
                break;
            }
        }
        // Assemble.
        left.right = $__getByIdOffset(current, "left", 2);
        right.left = $__getByIdOffset(current, "right", 3);
        current.left = $__getByIdOffset(dummy, "right", 3);
        current.right = $__getByIdOffset(dummy, "left", 2);
        this.root_ = current;
    }
}
function runIteration() {
    for (let i = 0; i < 100; ++i)
        SplayRun();
}
SplaySetup();
runIteration();
