class Point {
    constructor(
        public a: number,
        public b: number,
        public c: number,
        public x: number,
        public y: number,
        public z: number,
    ) {}
}

class Pseudo {
    constructor(public x: number, public y: number, public z: number) {}
}

const checksum = 119.06129888549846;

function run() {
    const ps = new Pseudo(3, 4, 5);
    const pt = new Point(4, 5, 6, 7, 8, 9);
    let total = 0;
    for (let i = 0; i < 10000; i++) {
        total += ps.x + ps.z + ps.y - pt.a - pt.b - pt.c - pt.x - pt.y - pt.z;
        total += ps.y + ps.x + ps.z * pt.b + pt.c + pt.y + pt.x + pt.z + pt.a;
        total += ps.x + ps.y + ps.z / (pt.b + pt.a + pt.c + pt.x + pt.z + pt.y);
        if (i % 2 == 0) {
            total -= ps.x + pt.a - ps.y + ps.z;
            total += pt.y + pt.x + pt.z;
        } else {
            total /= ps.x + pt.z + ps.y + ps.z;
            total += pt.a + pt.c + pt.b;
        }
        if (i % 3 == 0) {
            total /= ps.x + pt.z + ps.y + ps.z;
            total += pt.a + pt.c + pt.b;
        } else {
            total -= ps.x + pt.a - ps.y + ps.z;
            total += pt.y + pt.x + pt.z;
        }
        if (i % 4 == 1) {
            total -= ps.x + pt.a - ps.y + ps.z;
            total += pt.y + pt.x + pt.z;
            total -= ps.x + pt.a - ps.y + ps.z;
            total += pt.y + pt.x + pt.z;
        } else {
            total /= ps.x + pt.z + ps.y + ps.z;
            total += pt.a + pt.c + pt.b;
            total += ps.x + ps.z + ps.y - pt.a;
            total += ps.y + pt.c + pt.y + pt.x;
        }
        total += pt.a - pt.b - pt.c - pt.x - pt.y - pt.z - ps.x + ps.z + ps.y;
        total += ps.y + pt.c + pt.y + pt.x + pt.z + pt.a + ps.x + ps.z * pt.b;
        total += ps.x + pt.c + pt.x + pt.z + ps.y + ps.z / (pt.b + pt.a + pt.y);
    }
    if (total != checksum) {
        throw new Error("bad total");
    }
}

for (let i = 0; i < 20; i++) {
    run();
}
