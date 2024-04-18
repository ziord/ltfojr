"use strict";
class Point {
    constructor(a, b, c, x, y, z) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.x = x;
        this.y = y;
        this.z = z;
    }
}
class Pseudo {
    constructor(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    commit(t) {
        return $__getByIdOffset(this, "x", 0) + $__getByIdOffset(this, "y", 1) + $__getByIdOffset(this, "z", 2) - t;
    }
    patch(t) {
        return $__getByIdOffset(this, "x", 0) * $__getByIdOffset(this, "y", 1) - $__getByIdOffset(this, "x", 0) / $__getByIdOffset(this, "y", 1) - t;
    }
    push(t) {
        return $__getByIdOffset(this, "x", 0) << $__getByIdOffset(this, "y", 1) >> $__getByIdOffset(this, "z", 2) - t;
    }
}
const checksum = 278.7327634675502;
function run() {
    const ps = new Pseudo(3, 4, 5);
    const pt = new Point(4, 5, 6, 7, 8, 9);
    let total = 0;
    for (let i = 0; i < 10000; i++) {
        total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) + $__getByIdOffset(ps, "y", 1) - $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(pt, "b", 1) - $__getByIdOffset(pt, "c", 2) - $__getByIdOffset(pt, "x", 3) - $__getByIdOffset(pt, "y", 4) - $__getByIdOffset(pt, "z", 5);
        total += $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) * $__getByIdOffset(pt, "b", 1) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(pt, "a", 0);
        total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2) / ($__getByIdOffset(pt, "b", 1) + $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(pt, "y", 4));
        if (i % 2 == 0) {
            total -= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5);
        }
        else {
            total /= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "b", 1);
        }
        if (i % 3 == 0) {
            total /= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "b", 1);
        }
        else {
            total -= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5);
        }
        if (i % 4 == 0) {
            total -= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5);
            total -= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5);
        }
        else {
            total /= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "b", 1);
            total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) + $__getByIdOffset(ps, "y", 1) - $__getByIdOffset(pt, "a", 0);
            total += $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3);
        }
        total += $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(pt, "b", 1) - $__getByIdOffset(pt, "c", 2) - $__getByIdOffset(pt, "x", 3) - $__getByIdOffset(pt, "y", 4) - $__getByIdOffset(pt, "z", 5) - $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) + $__getByIdOffset(ps, "y", 1);
        total += $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) * $__getByIdOffset(pt, "b", 1);
        total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2) / ($__getByIdOffset(pt, "b", 1) + $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "y", 4));
        // ...
        total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) + $__getByIdOffset(ps, "y", 1) - $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(pt, "b", 1) - $__getByIdOffset(pt, "c", 2) - $__getByIdOffset(pt, "x", 3) - $__getByIdOffset(pt, "y", 4) - $__getByIdOffset(pt, "z", 5);
        total += $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) * $__getByIdOffset(pt, "b", 1) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(pt, "a", 0);
        total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2) / ($__getByIdOffset(pt, "b", 1) + $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(pt, "y", 4));
        if (i % 2 == 1) {
            total -= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5);
        }
        else {
            total /= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "b", 1);
        }
        if (i % 3 == 1) {
            total /= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "b", 1);
        }
        else {
            total -= $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2);
            total += $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5);
        }
        total += $__getByIdOffset(pt, "a", 0) - $__getByIdOffset(pt, "b", 1) - $__getByIdOffset(pt, "c", 2) - $__getByIdOffset(pt, "x", 3) - $__getByIdOffset(pt, "y", 4) - $__getByIdOffset(pt, "z", 5) - $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) + $__getByIdOffset(ps, "y", 1);
        total += $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "y", 4) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(ps, "z", 2) * $__getByIdOffset(pt, "b", 1);
        total += $__getByIdOffset(ps, "x", 0) + $__getByIdOffset(pt, "c", 2) + $__getByIdOffset(pt, "x", 3) + $__getByIdOffset(pt, "z", 5) + $__getByIdOffset(ps, "y", 1) + $__getByIdOffset(ps, "z", 2) / ($__getByIdOffset(pt, "b", 1) + $__getByIdOffset(pt, "a", 0) + $__getByIdOffset(pt, "y", 4));
        total += ps.commit($__getByIdOffset(pt, "a", 0)) + ps.patch($__getByIdOffset(pt, "y", 4)) + ps.push($__getByIdOffset(pt, "z", 5));
    }
    if (total != checksum) {
        throw new Error("bad total");
    }
}
for (let i = 0; i < 20; i++) {
    run();
}
