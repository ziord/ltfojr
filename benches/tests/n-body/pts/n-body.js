"use strict";
/* The Great Computer Language Shootout
   http://shootout.alioth.debian.org/
   contributed by Isaac Gouy */
var PI = 3.141592653589793;
var SOLAR_MASS = 4 * PI * PI;
var DAYS_PER_YEAR = 365.24;
class Body {
    constructor(x, y, z, vx, vy, vz, mass) {
        $__putByIdDirect(this, "x", void 0);
        $__putByIdDirect(this, "y", void 1);
        $__putByIdDirect(this, "z", void 2);
        $__putByIdDirect(this, "vx", void 3);
        $__putByIdDirect(this, "vy", void 4);
        $__putByIdDirect(this, "vz", void 5);
        $__putByIdDirect(this, "mass", void 6);
        this.x = x;
        this.y = y;
        this.z = z;
        this.vx = vx;
        this.vy = vy;
        this.vz = vz;
        this.mass = mass;
    }
    offsetMomentum(px, py, pz) {
        this.vx = -px / SOLAR_MASS;
        this.vy = -py / SOLAR_MASS;
        this.vz = -pz / SOLAR_MASS;
        return this;
    }
}
function Jupiter() {
    return new Body(4.84143144246472090e+00, -1.16032004402742839e+00, -1.03622044471123109e-01, 1.66007664274403694e-03 * DAYS_PER_YEAR, 7.69901118419740425e-03 * DAYS_PER_YEAR, -6.90460016972063023e-05 * DAYS_PER_YEAR, 9.54791938424326609e-04 * SOLAR_MASS);
}
function Saturn() {
    return new Body(8.34336671824457987e+00, 4.12479856412430479e+00, -4.03523417114321381e-01, -2.76742510726862411e-03 * DAYS_PER_YEAR, 4.99852801234917238e-03 * DAYS_PER_YEAR, 2.30417297573763929e-05 * DAYS_PER_YEAR, 2.85885980666130812e-04 * SOLAR_MASS);
}
function Uranus() {
    return new Body(1.28943695621391310e+01, -1.51111514016986312e+01, -2.23307578892655734e-01, 2.96460137564761618e-03 * DAYS_PER_YEAR, 2.37847173959480950e-03 * DAYS_PER_YEAR, -2.96589568540237556e-05 * DAYS_PER_YEAR, 4.36624404335156298e-05 * SOLAR_MASS);
}
function Neptune() {
    return new Body(1.53796971148509165e+01, -2.59193146099879641e+01, 1.79258772950371181e-01, 2.68067772490389322e-03 * DAYS_PER_YEAR, 1.62824170038242295e-03 * DAYS_PER_YEAR, -9.51592254519715870e-05 * DAYS_PER_YEAR, 5.15138902046611451e-05 * SOLAR_MASS);
}
function Sun() {
    return new Body(0.0, 0.0, 0.0, 0.0, 0.0, 0.0, SOLAR_MASS);
}
class NBodySystem {
    constructor(bodies) {
        $__putByIdDirect(this, "bodies", void 0);
        this.bodies = bodies;
        let px = 0.0;
        let py = 0.0;
        let pz = 0.0;
        let size = this.bodies.length;
        for (let i = 0; i < size; i++) {
            let b = this.bodies[i];
            let m = $__getByIdOffset(b, "mass", 6);
            px += $__getByIdOffset(b, "vx", 3) * m;
            py += $__getByIdOffset(b, "vy", 4) * m;
            pz += $__getByIdOffset(b, "vz", 5) * m;
        }
        this.bodies[0].offsetMomentum(px, py, pz);
    }
    advance(dt) {
        let dx, dy, dz, distance, mag;
        let size = $__getByIdOffset(this, "bodies", 0).length;
        for (var i = 0; i < size; i++) {
            let bodyi = $__getByIdOffset(this, "bodies", 0)[i];
            for (let j = i + 1; j < size; j++) {
                let bodyj = $__getByIdOffset(this, "bodies", 0)[j];
                dx = $__getByIdOffset(bodyi, "x", 0) - $__getByIdOffset(bodyj, "x", 0);
                dy = $__getByIdOffset(bodyi, "y", 1) - $__getByIdOffset(bodyj, "y", 1);
                dz = $__getByIdOffset(bodyi, "z", 2) - $__getByIdOffset(bodyj, "z", 2);
                distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                mag = dt / (distance * distance * distance);
                bodyi.vx -= dx * $__getByIdOffset(bodyj, "mass", 6) * mag;
                bodyi.vy -= dy * $__getByIdOffset(bodyj, "mass", 6) * mag;
                bodyi.vz -= dz * $__getByIdOffset(bodyj, "mass", 6) * mag;
                bodyj.vx += dx * $__getByIdOffset(bodyi, "mass", 6) * mag;
                bodyj.vy += dy * $__getByIdOffset(bodyi, "mass", 6) * mag;
                bodyj.vz += dz * $__getByIdOffset(bodyi, "mass", 6) * mag;
            }
        }
        for (var i = 0; i < size; i++) {
            let body = $__getByIdOffset(this, "bodies", 0)[i];
            body.x += dt * $__getByIdOffset(body, "vx", 3);
            body.y += dt * $__getByIdOffset(body, "vy", 4);
            body.z += dt * $__getByIdOffset(body, "vz", 5);
        }
    }
    energy() {
        let dx, dy, dz, distance;
        let e = 0.0;
        let size = $__getByIdOffset(this, "bodies", 0).length;
        for (let i = 0; i < size; i++) {
            let bodyi = $__getByIdOffset(this, "bodies", 0)[i];
            e += 0.5 * $__getByIdOffset(bodyi, "mass", 6) *
                ($__getByIdOffset(bodyi, "vx", 3) * $__getByIdOffset(bodyi, "vx", 3)
                    + $__getByIdOffset(bodyi, "vy", 4) * $__getByIdOffset(bodyi, "vy", 4)
                    + $__getByIdOffset(bodyi, "vz", 5) * $__getByIdOffset(bodyi, "vz", 5));
            for (let j = i + 1; j < size; j++) {
                let bodyj = $__getByIdOffset(this, "bodies", 0)[j];
                dx = $__getByIdOffset(bodyi, "x", 0) - $__getByIdOffset(bodyj, "x", 0);
                dy = $__getByIdOffset(bodyi, "y", 1) - $__getByIdOffset(bodyj, "y", 1);
                dz = $__getByIdOffset(bodyi, "z", 2) - $__getByIdOffset(bodyj, "z", 2);
                distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                e -= ($__getByIdOffset(bodyi, "mass", 6) * $__getByIdOffset(bodyj, "mass", 6)) / distance;
            }
        }
        return e;
    }
}
function run() {
    let ret = 0;
    for (let n = 3; n <= 24; n *= 2) {
        (function () {
            let bodies = new NBodySystem(Array(Sun(), Jupiter(), Saturn(), Uranus(), Neptune()));
            let max = n * 100;
            ret += bodies.energy();
            for (let i = 0; i < max; i++) {
                bodies.advance(0.01);
            }
            ret += bodies.energy();
        })();
    }
    var expected = -1.3524862408537381;
    if (ret != expected)
        throw "ERROR: bad result: expected " + expected + " but got " + ret;
}
function runIteration() {
    for (let i = 0; i < 15; ++i)
        run();
}
runIteration();
