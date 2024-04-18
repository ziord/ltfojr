const kSplayTreeSize = 8000;
const kSplayTreeModifications = 80;
const kSplayTreePayloadDepth = 5;

let splayTree: SplayTree | null = null;
let splaySampleTimeStart = 0.0;

interface PayloadTree {
    array?: number[];
    string?: string;
    left?: PayloadTree,
    right?: PayloadTree,
}

function GeneratePayloadTree(depth: number, tag: string): PayloadTree {
    if (depth === 0) {
        return {
            array: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
            string: `String for key ${tag} in leaf node`
        };
    } else {
        return {
            left: GeneratePayloadTree(depth - 1, tag),
            right: GeneratePayloadTree(depth - 1, tag)
        };
    }
}

function GenerateKey(): number {
    // The benchmark framework guarantees that Math.random is
    // deterministic; see base.js.
    return Math.random();
}

var splaySamples: number[] = [];

function SplayLatency(): number[] {
    return splaySamples;
}

function SplayUpdateStats(time: number): void {
    const pause = time - splaySampleTimeStart;
    splaySampleTimeStart = time;
    splaySamples.push(pause);
}

function InsertNewNode(): number {
    // Insert new node with a unique key.
    let key: number;
    do {
        key = GenerateKey();
    } while (splayTree!.find(key) !== null);
    const payload = GeneratePayloadTree(kSplayTreePayloadDepth, String(key));
    splayTree!.insert(key, payload);
    return key;
}

function SplaySetup(): void {
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

function SplayTearDown(): void {
    // Allow the garbage collector to reclaim the memory
    // used by the splay tree no matter how we exit the
    // tear down function.
    const keys = splayTree!.exportKeys();
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

function SplayRun(): void {
    // Replace a few nodes in the splay tree.
    for (let i = 0; i < kSplayTreeModifications; i++) {
        const key = InsertNewNode();
        const greatest = splayTree!.findGreatestLessThan(key);
        if (greatest === null) splayTree!.remove(key);
        else splayTree!.remove(greatest.key);
    }
    SplayUpdateStats(performance.now());
}

class SplayNode {
    constructor(public key: number, public value: PayloadTree, public left: SplayNode | null = null, public right: SplayNode | null = null) {}

    traverse_(f: (_: SplayNode | null) => void) {
        var current: SplayNode | null = this;
        while (current) {
          var left = current.left;
          if (left) left.traverse_(f);
          f(current);
          current = current.right;
        }
    }
}

class SplayTree {
    root_: SplayNode | null = null;

    isEmpty(): boolean {
        return !this.root_;
    }

    insert(key: number, value: PayloadTree): void {
        if (this.isEmpty()) {
            this.root_ = new SplayNode(key, value);
            return;
        }
        // Splay on the key to move the last node on the search path for
        // the key to the root of the tree.
        this.splay_(key);
        if (this.root_!.key === key) {
            return;
        }
        const node = new SplayNode(key, value);
        if (key > this.root_!.key) {
            node.left = this.root_;
            node.right = this.root_!.right;
            this.root_!.right = null;
        } else {
            node.right = this.root_;
            node.left = this.root_!.left;
            this.root_!.left = null;
        }
        this.root_ = node;
    }

    remove(key: number): SplayNode {
        if (this.isEmpty()) {
            throw new Error('Key not found: ' + key);
        }
        this.splay_(key);
        if (this.root_!.key !== key) {
            throw new Error('Key not found: ' + key);
        }
        let removed = this.root_!;
        if (!this.root_!.left) {
            this.root_ = this.root_!.right;
        } else {
            const right = this.root_!.right;
            this.root_ = this.root_!.left;
            // Splay to make sure that the new root has an empty right child.
            this.splay_(key);
            // Insert the original right child as the right child of the new
            // root.
            this.root_!.right = right;
        }
        return removed;
    }

    find(key: number): SplayNode | null {
        if (this.isEmpty()) {
            return null;
        }
        this.splay_(key);
        return this.root_!.key === key ? this.root_ : null;
    }

    findMax(opt_startNode?: SplayNode): SplayNode | null {
        if (this.isEmpty()) {
            return null;
        }
        let current = opt_startNode || this.root_;
        while (current!.right) {
            current = current!.right;
        }
        return current;
    }

    findGreatestLessThan(key: number): SplayNode | null {
        if (this.isEmpty()) {
            return null;
        }
        // Splay on the key to move the node with the given key or the last
        // node on the search path to the top of the tree.
        this.splay_(key);
        // Now the result is either the root node or the greatest node in
        // the left subtree.
        if (this.root_!.key < key) {
            return this.root_;
        } else if (this.root_!.left) {
            return this.findMax(this.root_!.left);
        } else {
            return null;
        }
    }

    exportKeys(): number[] {
        const result: number[] = [];
        if (!this.isEmpty()) {
            this.root_!.traverse_(node => {
                if (node) result.push(node.key);
            });
        }
        return result;
    }

    private splay_(key: number): void {
        if (this.isEmpty()) {
            return;
        }
        // Create a dummy node.  The use of the dummy node is a bit
        // counter-intuitive: The right child of the dummy node will hold
        // the L tree of the algorithm.  The left child of the dummy node
        // will hold the R tree of the algorithm.  Using a dummy node, left
        // and right will always be nodes and we avoid special cases.
        let dummy: SplayNode, left: SplayNode, right: SplayNode;
        dummy = left = right = new SplayNode(null as any, null as any);
        let current = this.root_!;
        while (true) {
            if (key < current.key) {
                if (!current.left) {
                    break;
                }
                if (key < current.left.key) {
                    // Rotate right.
                    const tmp = current.left;
                    current.left = tmp.right;
                    tmp.right = current;
                    current = tmp;
                    if (!current.left) {
                        break;
                    }
                }
                // Link right.
                right.left = current;
                right = current;
                current = current.left!;
            } else if (key > current.key) {
                if (!current.right) {
                    break;
                }
                if (key > current.right.key) {
                    // Rotate left.
                    const tmp = current.right;
                    current.right = tmp.left;
                    tmp.left = current;
                    current = tmp;
                    if (!current.right) {
                        break;
                    }
                }
                // Link left.
                left.right = current;
                left = current;
                current = current.right!;
            } else {
                break;
            }
        }
        // Assemble.
        left.right = current.left;
        right.left = current.right;
        current.left = dummy.right;
        current.right = dummy.left;
        this.root_ = current;
    }
}

function runIteration(): void {
    for (let i = 0; i < 100; ++i)
        SplayRun();
}

SplaySetup();
runIteration();
