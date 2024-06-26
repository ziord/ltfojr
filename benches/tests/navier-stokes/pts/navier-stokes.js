"use strict";
var solver = null;
var nsFrameCounter = 0;
function runNavierStokes() {
    solver.update();
    nsFrameCounter++;
    if (nsFrameCounter == 15)
        checkResult(solver.getDens());
}
function checkResult(dens) {
    let result = 0;
    for (var i = 7000; i < 7100; i++) {
        result += ~~((dens[i] * 10));
    }
    if (result != 77) {
        throw (new Error("checksum failed"));
    }
}
function setupNavierStokes() {
    solver = new FluidField(null);
    solver.setResolution(128, 128);
    solver.setIterations(20);
    solver.setDisplayFunction(function () { });
    solver.setUICallback(prepareFrame);
    solver.reset();
}
function tearDownNavierStokes() {
    solver = null;
}
function addPoints(field) {
    const n = 64;
    for (var i = 1; i <= n; i++) {
        field.setVelocity(i, i, n, n);
        field.setDensity(i, i, 5);
        field.setVelocity(i, n - i, -n, -n);
        field.setDensity(i, n - i, 20);
        field.setVelocity(128 - i, n + i, -n, -n);
        field.setDensity(128 - i, n + i, 30);
    }
}
var framesTillAddingPoints = 0;
var framesBetweenAddingPoints = 5;
function prepareFrame(field) {
    if (framesTillAddingPoints == 0) {
        addPoints(field);
        framesTillAddingPoints = framesBetweenAddingPoints;
        framesBetweenAddingPoints++;
    }
    else {
        framesTillAddingPoints--;
    }
}
var iterations = 10;
var visc = 0.5;
var dt = 0.1;
var dens;
var dens_prev;
var u;
var u_prev;
var v;
var v_prev;
var width;
var height;
var rowSize;
var size;
var displayFunc;
class Field {
    constructor(dens, u, v) {
        this.dens = dens;
        this.u = u;
        this.v = v;
    }
    // Just exposing the fields here rather than using accessors is a measurable win during display (maybe 5%)
    // but makes the code ugly.
    setDensity(x, y, d) {
        $__getByIdOffset(this, "dens", 0)[(x + 1) + (y + 1) * rowSize] = d;
    }
    getDensity(x, y) {
        return $__getByIdOffset(this, "dens", 0)[(x + 1) + (y + 1) * rowSize];
    }
    setVelocity(x, y, xv, yv) {
        $__getByIdOffset(this, "u", 1)[(x + 1) + (y + 1) * rowSize] = xv;
        $__getByIdOffset(this, "v", 2)[(x + 1) + (y + 1) * rowSize] = yv;
    }
    getXVelocity(x, y) {
        return $__getByIdOffset(this, "u", 1)[(x + 1) + (y + 1) * rowSize];
    }
    getYVelocity(x, y) {
        return $__getByIdOffset(this, "v", 2)[(x + 1) + (y + 1) * rowSize];
    }
    width() { return width; }
    height() { return height; }
}
function addFields(x, s, dt) {
    for (var i = 0; i < size; i++)
        x[i] += dt * s[i];
}
function set_bnd(b, x) {
    if (b === 1) {
        for (var i = 1; i <= width; i++) {
            x[i] = x[i + rowSize];
            x[i + (height + 1) * rowSize] = x[i + height * rowSize];
        }
        for (var j = 1; j <= height; j++) {
            x[j * rowSize] = -x[1 + j * rowSize];
            x[(width + 1) + j * rowSize] = -x[width + j * rowSize];
        }
    }
    else if (b === 2) {
        for (var i = 1; i <= width; i++) {
            x[i] = -x[i + rowSize];
            x[i + (height + 1) * rowSize] = -x[i + height * rowSize];
        }
        for (var j = 1; j <= height; j++) {
            x[j * rowSize] = x[1 + j * rowSize];
            x[(width + 1) + j * rowSize] = x[width + j * rowSize];
        }
    }
    else {
        for (var i = 1; i <= width; i++) {
            x[i] = x[i + rowSize];
            x[i + (height + 1) * rowSize] = x[i + height * rowSize];
        }
        for (var j = 1; j <= height; j++) {
            x[j * rowSize] = x[1 + j * rowSize];
            x[(width + 1) + j * rowSize] = x[width + j * rowSize];
        }
    }
    var maxEdge = (height + 1) * rowSize;
    x[0] = 0.5 * (x[1] + x[rowSize]);
    x[maxEdge] = 0.5 * (x[1 + maxEdge] + x[height * rowSize]);
    x[(width + 1)] = 0.5 * (x[width] + x[(width + 1) + rowSize]);
    x[(width + 1) + maxEdge] = 0.5 * (x[width + maxEdge] + x[(width + 1) + height * rowSize]);
}
function lin_solve(b, x, x0, a, c) {
    if (a === 0 && c === 1) {
        for (var j = 1; j <= height; j++) {
            var currentRow = j * rowSize;
            ++currentRow;
            for (var i = 0; i < width; i++) {
                x[currentRow] = x0[currentRow];
                ++currentRow;
            }
        }
        set_bnd(b, x);
    }
    else {
        var invC = 1 / c;
        for (var k = 0; k < iterations; k++) {
            for (var j = 1; j <= height; j++) {
                var lastRow = (j - 1) * rowSize;
                var currentRow = j * rowSize;
                var nextRow = (j + 1) * rowSize;
                var lastX = x[currentRow];
                ++currentRow;
                for (var i = 1; i <= width; i++)
                    lastX = x[currentRow] = (x0[currentRow] + a * (lastX + x[++currentRow] + x[++lastRow] + x[++nextRow])) * invC;
            }
            set_bnd(b, x);
        }
    }
}
function diffuse(b, x, x0, dt) {
    const a = 0;
    lin_solve(b, x, x0, a, 1 + 4 * a);
}
function lin_solve2(x, x0, y, y0, a, c) {
    if (a === 0 && c === 1) {
        for (var j = 1; j <= height; j++) {
            var currentRow = j * rowSize;
            ++currentRow;
            for (var i = 0; i < width; i++) {
                x[currentRow] = x0[currentRow];
                y[currentRow] = y0[currentRow];
                ++currentRow;
            }
        }
        set_bnd(1, x);
        set_bnd(2, y);
    }
    else {
        var invC = 1 / c;
        for (var k = 0; k < iterations; k++) {
            for (var j = 1; j <= height; j++) {
                var lastRow = (j - 1) * rowSize;
                var currentRow = j * rowSize;
                var nextRow = (j + 1) * rowSize;
                var lastX = x[currentRow];
                var lastY = y[currentRow];
                ++currentRow;
                for (var i = 1; i <= width; i++) {
                    lastX = x[currentRow] = (x0[currentRow] + a * (lastX + x[currentRow] + x[lastRow] + x[nextRow])) * invC;
                    lastY = y[currentRow] = (y0[currentRow] + a * (lastY + y[++currentRow] + y[++lastRow] + y[++nextRow])) * invC;
                }
            }
            set_bnd(1, x);
            set_bnd(2, y);
        }
    }
}
function diffuse2(x, x0, y, y0, dt) {
    const a = 0;
    lin_solve2(x, x0, y, y0, a, 1 + 4 * a);
}
function advect(b, d, d0, u, v, dt) {
    var Wdt0 = dt * width;
    var Hdt0 = dt * height;
    var Wp5 = width + 0.5;
    var Hp5 = height + 0.5;
    for (var j = 1; j <= height; j++) {
        var pos = j * rowSize;
        for (var i = 1; i <= width; i++) {
            var x = i - Wdt0 * u[++pos];
            var y = j - Hdt0 * v[pos];
            if (x < 0.5)
                x = 0.5;
            else if (x > Wp5)
                x = Wp5;
            var i0 = x | 0;
            var i1 = i0 + 1;
            if (y < 0.5)
                y = 0.5;
            else if (y > Hp5)
                y = Hp5;
            var j0 = y | 0;
            var j1 = j0 + 1;
            var s1 = x - i0;
            var s0 = 1 - s1;
            var t1 = y - j0;
            var t0 = 1 - t1;
            var row1 = j0 * rowSize;
            var row2 = j1 * rowSize;
            d[pos] = s0 * (t0 * d0[i0 + row1] + t1 * d0[i0 + row2]) + s1 * (t0 * d0[i1 + row1] + t1 * d0[i1 + row2]);
        }
    }
    set_bnd(b, d);
}
function project(u, v, p, div) {
    var h = -0.5 / Math.sqrt(width * height);
    for (var j = 1; j <= height; j++) {
        var row = j * rowSize;
        var previousRow = (j - 1) * rowSize;
        var prevValue = row - 1;
        var currentRow = row;
        var nextValue = row + 1;
        var nextRow = (j + 1) * rowSize;
        for (var i = 1; i <= width; i++) {
            div[++currentRow] = h * (u[++nextValue] - u[++prevValue] + v[++nextRow] - v[++previousRow]);
            p[currentRow] = 0;
        }
    }
    set_bnd(0, div);
    set_bnd(0, p);
    lin_solve(0, p, div, 1, 4);
    var wScale = 0.5 * width;
    var hScale = 0.5 * height;
    for (var j = 1; j <= height; j++) {
        var prevPos = j * rowSize - 1;
        var currentPos = j * rowSize;
        var nextPos = j * rowSize + 1;
        var prevRow = (j - 1) * rowSize;
        var currentRow = j * rowSize;
        var nextRow = (j + 1) * rowSize;
        for (var i = 1; i <= width; i++) {
            u[++currentPos] -= wScale * (p[++nextPos] - p[++prevPos]);
            v[currentPos] -= hScale * (p[++nextRow] - p[++prevRow]);
        }
    }
    set_bnd(1, u);
    set_bnd(2, v);
}
function dens_step(x, x0, u, v, dt) {
    addFields(x, x0, dt);
    diffuse(0, x0, x, dt);
    advect(0, x, x0, u, v, dt);
}
function vel_step(u, v, u0, v0, dt) {
    addFields(u, u0, dt);
    addFields(v, v0, dt);
    var temp = u0;
    u0 = u;
    u = temp;
    var temp = v0;
    v0 = v;
    v = temp;
    diffuse2(u, u0, v, v0, dt);
    project(u, v, u0, v0);
    var temp = u0;
    u0 = u;
    u = temp;
    var temp = v0;
    v0 = v;
    v = temp;
    advect(1, u, u0, u0, v0, dt);
    advect(2, v, v0, u0, v0, dt);
    project(u, v, u0, v0);
}
var uiCallback = function (_c) { };
function queryUI(d, u, v) {
    for (var i = 0; i < size; i++)
        u[i] = v[i] = d[i] = 0.0;
    uiCallback(new Field(d, u, v));
}
class FluidField {
    constructor(canvas) {
        this.setResolution(64, 64);
    }
    update() {
        queryUI(dens_prev, u_prev, v_prev);
        vel_step(u, v, u_prev, v_prev, dt);
        dens_step(dens, dens_prev, u, v, dt);
        displayFunc(new Field(dens, u, v));
    }
    setDisplayFunction(func) {
        displayFunc = func;
    }
    iterations() { return iterations; }
    setIterations(iters) {
        if (iters > 0 && iters <= 100)
            iterations = iters;
    }
    setUICallback(callback) {
        uiCallback = callback;
    }
    reset() {
        rowSize = width + 2;
        size = (width + 2) * (height + 2);
        dens = new Array(size);
        dens_prev = new Array(size);
        u = new Array(size);
        u_prev = new Array(size);
        v = new Array(size);
        v_prev = new Array(size);
        for (var i = 0; i < size; i++)
            dens_prev[i] = u_prev[i] = v_prev[i] = dens[i] = u[i] = v[i] = 0;
    }
    getDens() {
        return dens;
    }
    setResolution(hRes, wRes) {
        var res = wRes * hRes;
        if (res > 0 && res < 1000000 && (wRes != width || hRes != height)) {
            width = wRes;
            height = hRes;
            this.reset();
            return true;
        }
        return false;
    }
}
function runIteration() {
    for (let i = 0; i < 20; i++)
        runNavierStokes();
}
setupNavierStokes();
runIteration();
