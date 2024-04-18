"use strict";
let checkNumber;
/* Fake a Flog.* namespace */
var Flog;
(function (Flog) {
    let RayTracer;
    (function (RayTracer) {
        class Color {
            constructor(r, g, b) {
                this.red = r || 0.0;
                this.green = g || 0.0;
                this.blue = b || 0.0;
            }
            add(c1, c2) {
                const result = new Color(0, 0, 0);
                result.red = $__getByIdOffset(c1, "red", 0) + $__getByIdOffset(c2, "red", 0);
                result.green = $__getByIdOffset(c1, "green", 1) + $__getByIdOffset(c2, "green", 1);
                result.blue = $__getByIdOffset(c1, "blue", 2) + $__getByIdOffset(c2, "blue", 2);
                return result;
            }
            addScalar(c1, s) {
                const result = new Color(0, 0, 0);
                result.red = $__getByIdOffset(c1, "red", 0) + s;
                result.green = $__getByIdOffset(c1, "green", 1) + s;
                result.blue = $__getByIdOffset(c1, "blue", 2) + s;
                result.limit();
                return result;
            }
            subtract(c1, c2) {
                const result = new Color(0, 0, 0);
                result.red = $__getByIdOffset(c1, "red", 0) - $__getByIdOffset(c2, "red", 0);
                result.green = $__getByIdOffset(c1, "green", 1) - $__getByIdOffset(c2, "green", 1);
                result.blue = $__getByIdOffset(c1, "blue", 2) - $__getByIdOffset(c2, "blue", 2);
                return result;
            }
            multiply(c1, c2) {
                const result = new Color(0, 0, 0);
                result.red = $__getByIdOffset(c1, "red", 0) * $__getByIdOffset(c2, "red", 0);
                result.green = $__getByIdOffset(c1, "green", 1) * $__getByIdOffset(c2, "green", 1);
                result.blue = $__getByIdOffset(c1, "blue", 2) * $__getByIdOffset(c2, "blue", 2);
                return result;
            }
            multiplyScalar(c1, f) {
                const result = new Color(0, 0, 0);
                result.red = $__getByIdOffset(c1, "red", 0) * f;
                result.green = $__getByIdOffset(c1, "green", 1) * f;
                result.blue = $__getByIdOffset(c1, "blue", 2) * f;
                return result;
            }
            divideFactor(c1, f) {
                const result = new Color(0, 0, 0);
                result.red = $__getByIdOffset(c1, "red", 0) / f;
                result.green = $__getByIdOffset(c1, "green", 1) / f;
                result.blue = $__getByIdOffset(c1, "blue", 2) / f;
                return result;
            }
            limit() {
                this.red = ($__getByIdOffset(this, "red", 0) > 0.0) ? (($__getByIdOffset(this, "red", 0) > 1.0) ? 1.0 : $__getByIdOffset(this, "red", 0)) : 0.0;
                this.green = ($__getByIdOffset(this, "green", 1) > 0.0) ? (($__getByIdOffset(this, "green", 1) > 1.0) ? 1.0 : $__getByIdOffset(this, "green", 1)) : 0.0;
                this.blue = ($__getByIdOffset(this, "blue", 2) > 0.0) ? (($__getByIdOffset(this, "blue", 2) > 1.0) ? 1.0 : $__getByIdOffset(this, "blue", 2)) : 0.0;
            }
            distance(color) {
                const d = Math.abs($__getByIdOffset(this, "red", 0) - $__getByIdOffset(color, "red", 0)) + Math.abs($__getByIdOffset(this, "green", 1) - $__getByIdOffset(color, "green", 1)) + Math.abs($__getByIdOffset(this, "blue", 2) - $__getByIdOffset(color, "blue", 2));
                return d;
            }
            blend(c1, c2, w) {
                let result = new Color(0, 0, 0);
                result = Flog.RayTracer.Color.prototype.add(Flog.RayTracer.Color.prototype.multiplyScalar(c1, 1 - w), Flog.RayTracer.Color.prototype.multiplyScalar(c2, w));
                return result;
            }
            brightness() {
                const r = Math.floor($__getByIdOffset(this, "red", 0) * 255);
                const g = Math.floor($__getByIdOffset(this, "green", 1) * 255);
                const b = Math.floor($__getByIdOffset(this, "blue", 2) * 255);
                return (r * 77 + g * 150 + b * 29) >> 8;
            }
            toString() {
                const r = Math.floor($__getByIdOffset(this, "red", 0) * 255);
                const g = Math.floor($__getByIdOffset(this, "green", 1) * 255);
                const b = Math.floor($__getByIdOffset(this, "blue", 2) * 255);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
        }
        RayTracer.Color = Color;
        class Light {
            constructor(pos, color, intensity) {
                this.position = pos;
                this.color = color;
                this.intensity = intensity || 10.0;
            }
            toString() {
                return 'Light [' + $__getByIdOffset($__getByIdOffset(this, "position", 0), "x", 0) + ',' + $__getByIdOffset($__getByIdOffset(this, "position", 0), "y", 1) + ',' + $__getByIdOffset($__getByIdOffset(this, "position", 0), "z", 2) + ']';
            }
        }
        RayTracer.Light = Light;
        class Vector {
            constructor(x, y, z) {
                this.x = (x ? x : 0);
                this.y = (y ? y : 0);
                this.z = (z ? z : 0);
            }
            copy(vector) {
                this.x = $__getByIdOffset(vector, "x", 0);
                this.y = $__getByIdOffset(vector, "y", 1);
                this.z = $__getByIdOffset(vector, "z", 2);
            }
            normalize() {
                const m = this.magnitude();
                return new Vector($__getByIdOffset(this, "x", 0) / m, $__getByIdOffset(this, "y", 1) / m, $__getByIdOffset(this, "z", 2) / m);
            }
            magnitude() {
                return Math.sqrt(($__getByIdOffset(this, "x", 0) * $__getByIdOffset(this, "x", 0)) + ($__getByIdOffset(this, "y", 1) * $__getByIdOffset(this, "y", 1)) + ($__getByIdOffset(this, "z", 2) * $__getByIdOffset(this, "z", 2)));
            }
            cross(w) {
                return new Vector(-$__getByIdOffset(this, "z", 2) * $__getByIdOffset(w, "y", 1) + $__getByIdOffset(this, "y", 1) * $__getByIdOffset(w, "z", 2), $__getByIdOffset(this, "z", 2) * $__getByIdOffset(w, "x", 0) - $__getByIdOffset(this, "x", 0) * $__getByIdOffset(w, "z", 2), -$__getByIdOffset(this, "y", 1) * $__getByIdOffset(w, "x", 0) + $__getByIdOffset(this, "x", 0) * $__getByIdOffset(w, "y", 1));
            }
            dot(w) {
                return $__getByIdOffset(this, "x", 0) * $__getByIdOffset(w, "x", 0) + $__getByIdOffset(this, "y", 1) * $__getByIdOffset(w, "y", 1) + $__getByIdOffset(this, "z", 2) * $__getByIdOffset(w, "z", 2);
            }
            add(v, w) {
                return new Vector($__getByIdOffset(w, "x", 0) + $__getByIdOffset(v, "x", 0), $__getByIdOffset(w, "y", 1) + $__getByIdOffset(v, "y", 1), $__getByIdOffset(w, "z", 2) + $__getByIdOffset(v, "z", 2));
            }
            subtract(v, w) {
                if (!w || !v)
                    throw 'Vectors must be defined [' + v + ',' + w + ']';
                return new Vector($__getByIdOffset(v, "x", 0) - $__getByIdOffset(w, "x", 0), $__getByIdOffset(v, "y", 1) - $__getByIdOffset(w, "y", 1), $__getByIdOffset(v, "z", 2) - $__getByIdOffset(w, "z", 2));
            }
            multiplyVector(v, w) {
                return new Vector($__getByIdOffset(v, "x", 0) * $__getByIdOffset(w, "x", 0), $__getByIdOffset(v, "y", 1) * $__getByIdOffset(w, "y", 1), $__getByIdOffset(v, "z", 2) * $__getByIdOffset(w, "z", 2));
            }
            multiplyScalar(v, w) {
                return new Vector($__getByIdOffset(v, "x", 0) * w, $__getByIdOffset(v, "y", 1) * w, $__getByIdOffset(v, "z", 2) * w);
            }
            toString() {
                return 'Vector [' + $__getByIdOffset(this, "x", 0) + ',' + $__getByIdOffset(this, "y", 1) + ',' + $__getByIdOffset(this, "z", 2) + ']';
            }
        }
        RayTracer.Vector = Vector;
        class Ray {
            constructor(pos, dir) {
                this.position = pos;
                this.direction = dir;
            }
            toString() {
                return 'Ray [' + $__getByIdOffset(this, "position", 0) + ',' + $__getByIdOffset(this, "direction", 1) + ']';
            }
        }
        RayTracer.Ray = Ray;
        class Background {
            constructor(color, ambience) {
                this.color = color;
                this.ambience = ambience;
            }
        }
        RayTracer.Background = Background;
        class Scene {
            constructor() {
                this.camera = new Camera(new Flog.RayTracer.Vector(0, 0, -5), new Flog.RayTracer.Vector(0, 0, 1), new Flog.RayTracer.Vector(0, 1, 0));
                this.shapes = new Array();
                this.lights = new Array();
                this.background = new Background(new Color(0, 0, 0.5), 0.2);
            }
        }
        RayTracer.Scene = Scene;
        let Material;
        (function (Material) {
            class BaseMaterial {
                constructor() {
                    this.gloss = 2.0;
                    this.transparency = 0.0;
                    this.reflection = 0.0;
                    this.refraction = 0.50;
                    this.hasTexture = false;
                }
                getColor(u, v) {
                    return undefined;
                }
                wrapUp(t) {
                    t = t % 2.0;
                    if (t < -1)
                        t += 2.0;
                    if (t >= 1)
                        t -= 2.0;
                    return t;
                }
                toString() {
                    return 'Material [gloss=' + $__getByIdOffset(this, "gloss", 0) + ', transparency=' + $__getByIdOffset(this, "transparency", 1) + ', hasTexture=' + $__getByIdOffset(this, "hasTexture", 4) + ']';
                }
            }
            Material.BaseMaterial = BaseMaterial;
            class Solid extends BaseMaterial {
                constructor(color, reflection, refraction, transparency, gloss) {
                    super();
                    this.color = color;
                    this.reflection = reflection;
                    this.refraction = refraction;
                    this.transparency = transparency;
                    this.gloss = gloss;
                }
                getColor(u, v) {
                    return this.color;
                }
                toString() {
                    return 'SolidMaterial [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture + ']';
                }
            }
            Material.Solid = Solid;
            class Chessboard extends BaseMaterial {
                constructor(colorEven, colorOdd, reflection, transparency, gloss, density) {
                    super();
                    this.colorEven = colorEven;
                    this.colorOdd = colorOdd;
                    this.reflection = reflection;
                    this.transparency = transparency;
                    this.gloss = gloss;
                    this.density = density;
                    this.hasTexture = true;
                }
                getColor(u, v) {
                    const t = this.wrapUp(u * this.density) * this.wrapUp(v * this.density);
                    if (t < 0.0)
                        return this.colorEven;
                    else
                        return this.colorOdd;
                }
                toString() {
                    return 'ChessMaterial [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture + ']';
                }
            }
            Material.Chessboard = Chessboard;
        })(Material = RayTracer.Material || (RayTracer.Material = {}));
        let Shape;
        (function (Shape) {
            class Sphere {
                constructor(position, radius, material) {
                    this.position = position;
                    this.radius = radius;
                    this.material = material;
                }
                intersect(ray) {
                    var info = new Flog.RayTracer.IntersectionInfo();
                    info.shape = this;
                    var dst = Flog.RayTracer.Vector.prototype.subtract($__getByIdOffset(ray, "position", 0), $__getByIdOffset(this, "position", 0));
                    var B = dst.dot($__getByIdOffset(ray, "direction", 1));
                    var C = dst.dot(dst) - ($__getByIdOffset(this, "radius", 1) * $__getByIdOffset(this, "radius", 1));
                    var D = (B * B) - C;
                    if (D > 0) { // intersection!
                        info.isHit = true;
                        info.distance = (-B) - Math.sqrt(D);
                        info.position = Flog.RayTracer.Vector.prototype.add($__getByIdOffset(ray, "position", 0), Flog.RayTracer.Vector.prototype.multiplyScalar($__getByIdOffset(ray, "direction", 1), $__getByIdOffset(info, "distance", 6)));
                        info.normal = Flog.RayTracer.Vector.prototype.subtract($__getByIdOffset(info, "position", 3), $__getByIdOffset(this, "position", 0)).normalize();
                        info.color = $__getByIdOffset(this, "material", 2).getColor(0, 0);
                    }
                    else {
                        info.isHit = false;
                    }
                    return info;
                }
                toString() {
                    return 'Sphere [position=' + $__getByIdOffset(this, "position", 0) + ', radius=' + $__getByIdOffset(this, "radius", 1) + ']';
                }
            }
            Shape.Sphere = Sphere;
            class Plane {
                constructor(position, d, material) {
                    this.position = position;
                    this.d = d;
                    this.material = material;
                }
                intersect(ray) {
                    var info = new Flog.RayTracer.IntersectionInfo();
                    var Vd = $__getByIdOffset(this, "position", 0).dot($__getByIdOffset(ray, "direction", 1));
                    if (Vd == 0)
                        return info; // no intersection
                    var t = -($__getByIdOffset(this, "position", 0).dot($__getByIdOffset(ray, "position", 0)) + $__getByIdOffset(this, "d", 1)) / Vd;
                    if (t <= 0)
                        return info;
                    info.shape = this;
                    info.isHit = true;
                    info.position = Flog.RayTracer.Vector.prototype.add($__getByIdOffset(ray, "position", 0), Flog.RayTracer.Vector.prototype.multiplyScalar($__getByIdOffset(ray, "direction", 1), t));
                    info.normal = $__getByIdOffset(this, "position", 0);
                    info.distance = t;
                    if ($__getByIdOffset($__getByIdOffset(this, "material", 2), "hasTexture", 4)) {
                        var vU = new Flog.RayTracer.Vector($__getByIdOffset($__getByIdOffset(this, "position", 0), "y", 1), $__getByIdOffset($__getByIdOffset(this, "position", 0), "z", 2), -$__getByIdOffset($__getByIdOffset(this, "position", 0), "x", 0));
                        var vV = vU.cross($__getByIdOffset(this, "position", 0));
                        var u = $__getByIdOffset(info, "position", 3).dot(vU);
                        var v = $__getByIdOffset(info, "position", 3).dot(vV);
                        info.color = $__getByIdOffset(this, "material", 2).getColor(u, v);
                    }
                    else {
                        info.color = $__getByIdOffset(this, "material", 2).getColor(0, 0);
                    }
                    return info;
                }
                toString() {
                    return 'Plane [' + $__getByIdOffset(this, "position", 0) + ', d=' + $__getByIdOffset(this, "d", 1) + ']';
                }
            }
            Shape.Plane = Plane;
        })(Shape = RayTracer.Shape || (RayTracer.Shape = {}));
        class IntersectionInfo {
            constructor() {
                $__putByIdDirect(this, "isHit", void 0);
                $__putByIdDirect(this, "hitCount", void 1);
                $__putByIdDirect(this, "shape", void 2);
                $__putByIdDirect(this, "position", void 3);
                $__putByIdDirect(this, "normal", void 4);
                $__putByIdDirect(this, "color", void 5);
                $__putByIdDirect(this, "distance", void 6);
                this.isHit = false;
                this.hitCount = 0;
                this.shape = null;
                this.position = null;
                this.normal = null;
                this.distance = null;
                this.color = new Flog.RayTracer.Color(0, 0, 0);
            }
            toString() {
                return 'Intersection [' + $__getByIdOffset(this, "position", 3) + ']';
            }
        }
        RayTracer.IntersectionInfo = IntersectionInfo;
        class Camera {
            constructor(pos, lookAt, up) {
                $__putByIdDirect(this, "position", void 0);
                $__putByIdDirect(this, "lookAt", void 1);
                $__putByIdDirect(this, "equator", void 2);
                $__putByIdDirect(this, "up", void 3);
                $__putByIdDirect(this, "screen", void 4);
                this.position = pos;
                this.lookAt = lookAt;
                this.up = up;
                this.equator = lookAt.normalize().cross(up);
                this.screen = Flog.RayTracer.Vector.prototype.add(this.position, this.lookAt);
            }
            getRay(vx, vy) {
                var pos = Flog.RayTracer.Vector.prototype.subtract($__getByIdOffset(this, "screen", 4), Flog.RayTracer.Vector.prototype.subtract(Flog.RayTracer.Vector.prototype.multiplyScalar($__getByIdOffset(this, "equator", 2), vx), Flog.RayTracer.Vector.prototype.multiplyScalar($__getByIdOffset(this, "up", 3), vy)));
                pos.y = $__getByIdOffset(pos, "y", 1) * -1;
                var dir = Flog.RayTracer.Vector.prototype.subtract(pos, $__getByIdOffset(this, "position", 0));
                var ray = new Flog.RayTracer.Ray(pos, dir.normalize());
                return ray;
            }
            toString() {
                return 'Ray []';
            }
        }
        RayTracer.Camera = Camera;
        class Engine {
            constructor(options) {
                $__putByIdDirect(this, "options", void 0);
                $__putByIdDirect(this, "canvas", void 1);
                this.canvas = null;
                this.options = options || {
                    canvasHeight: 100,
                    canvasWidth: 100,
                    pixelWidth: 2,
                    pixelHeight: 2,
                    renderDiffuse: false,
                    renderShadows: false,
                    renderHighlights: false,
                    renderReflections: false,
                    rayDepth: 2
                };
                this.options.canvasHeight /= this.options.pixelHeight;
                this.options.canvasWidth /= this.options.pixelWidth;
            }
            setPixel(x, y, color) {
                var pxW, pxH;
                pxW = $__getByIdOffset(this, "options", 0).pixelWidth;
                pxH = $__getByIdOffset(this, "options", 0).pixelHeight;
                if ($__getByIdOffset(this, "canvas", 1)) {
                    $__getByIdOffset(this, "canvas", 1).fillStyle = color.toString();
                    $__getByIdOffset(this, "canvas", 1).fillRect(x * pxW, y * pxH, pxW, pxH);
                }
                else {
                    if (x === y) {
                        checkNumber += color.brightness();
                    }
                    // print(x * pxW, y * pxH, pxW, pxH);
                }
            }
            renderScene(scene, canvas) {
                checkNumber = 0;
                /* Get canvas */
                if (canvas) {
                    this.canvas = canvas.getContext("2d");
                }
                else {
                    this.canvas = null;
                }
                var canvasHeight = $__getByIdOffset(this, "options", 0).canvasHeight;
                var canvasWidth = $__getByIdOffset(this, "options", 0).canvasWidth;
                for (var y = 0; y < canvasHeight; y++) {
                    for (var x = 0; x < canvasWidth; x++) {
                        var yp = y * 1.0 / canvasHeight * 2 - 1;
                        var xp = x * 1.0 / canvasWidth * 2 - 1;
                        var ray = $__getByIdOffset(scene, "camera", 0).getRay(xp, yp);
                        var color = this.getPixelColor(ray, scene);
                        this.setPixel(x, y, color);
                    }
                }
                if (checkNumber !== 2321) {
                    throw new Error("Scene rendered incorrectly");
                }
            }
            getPixelColor(ray, scene) {
                var info = this.testIntersection(ray, scene, null);
                if ($__getByIdOffset(info, "isHit", 0)) {
                    var color = this.rayTrace(info, ray, scene, 0);
                    return color;
                }
                return $__getByIdOffset($__getByIdOffset(scene, "background", 3), "color", 0);
            }
            testIntersection(ray, scene, exclude) {
                var hits = 0;
                var best = new Flog.RayTracer.IntersectionInfo();
                best.distance = 2000;
                for (var i = 0; i < $__getByIdOffset(scene, "shapes", 1).length; i++) {
                    var shape = $__getByIdOffset(scene, "shapes", 1)[i];
                    if (shape != exclude) {
                        var info = shape.intersect(ray);
                        if ($__getByIdOffset(info, "isHit", 0) && $__getByIdOffset(info, "distance", 6) >= 0 && $__getByIdOffset(info, "distance", 6) < $__getByIdOffset(best, "distance", 6)) {
                            best = info;
                            hits++;
                        }
                    }
                }
                best.hitCount = hits;
                return best;
            }
            getReflectionRay(P, N, V) {
                var c1 = -N.dot(V);
                var R1 = Flog.RayTracer.Vector.prototype.add(Flog.RayTracer.Vector.prototype.multiplyScalar(N, 2 * c1), V);
                return new Flog.RayTracer.Ray(P, R1);
            }
            rayTrace(info, ray, scene, depth) {
                // Calc ambient
                var color = Flog.RayTracer.Color.prototype.multiplyScalar($__getByIdOffset(info, "color", 5), $__getByIdOffset($__getByIdOffset(scene, "background", 3), "ambience", 1));
                var oldColor = color;
                var shininess = Math.pow(10, $__getByIdOffset(info, "shape", 2).material.gloss + 1);
                for (var i = 0; i < $__getByIdOffset(scene, "lights", 2).length; i++) {
                    var light = $__getByIdOffset(scene, "lights", 2)[i];
                    // Calc diffuse lighting
                    var v = Flog.RayTracer.Vector.prototype.subtract($__getByIdOffset(light, "position", 0), $__getByIdOffset(info, "position", 3)).normalize();
                    if ($__getByIdOffset(this, "options", 0).renderDiffuse) {
                        var L = v.dot($__getByIdOffset(info, "normal", 4));
                        if (L > 0.0) {
                            color = Flog.RayTracer.Color.prototype.add(color, Flog.RayTracer.Color.prototype.multiply($__getByIdOffset(info, "color", 5), Flog.RayTracer.Color.prototype.multiplyScalar($__getByIdOffset(light, "color", 1), L)));
                        }
                    }
                    // The greater the depth the more accurate the colours, but
                    // this is exponentially (!) expensive
                    if (depth <= $__getByIdOffset(this, "options", 0).rayDepth) {
                        // calculate reflection ray
                        if ($__getByIdOffset(this, "options", 0).renderReflections && $__getByIdOffset(info, "shape", 2).material.reflection > 0) {
                            var reflectionRay = this.getReflectionRay($__getByIdOffset(info, "position", 3), $__getByIdOffset(info, "normal", 4), $__getByIdOffset(ray, "direction", 1));
                            var refl = this.testIntersection(reflectionRay, scene, $__getByIdOffset(info, "shape", 2));
                            if ($__getByIdOffset(refl, "isHit", 0) && $__getByIdOffset(refl, "distance", 6) > 0) {
                                refl.color = this.rayTrace(refl, reflectionRay, scene, depth + 1);
                            }
                            else {
                                refl.color = $__getByIdOffset($__getByIdOffset(scene, "background", 3), "color", 0);
                            }
                            color = Flog.RayTracer.Color.prototype.blend(color, $__getByIdOffset(refl, "color", 5), $__getByIdOffset(info, "shape", 2).material.reflection);
                        }
                        // Refraction
                        /* TODO */
                    }
                    /* Render shadows and highlights */
                    var shadowInfo = new Flog.RayTracer.IntersectionInfo();
                    if ($__getByIdOffset(this, "options", 0).renderShadows) {
                        var shadowRay = new Flog.RayTracer.Ray($__getByIdOffset(info, "position", 3), v);
                        shadowInfo = this.testIntersection(shadowRay, scene, $__getByIdOffset(info, "shape", 2));
                        if ($__getByIdOffset(shadowInfo, "isHit", 0) && $__getByIdOffset(shadowInfo, "shape", 2) != $__getByIdOffset(info, "shape", 2) /*&& shadowInfo.shape.type != 'PLANE'*/) {
                            var vA = Flog.RayTracer.Color.prototype.multiplyScalar(color, 0.5);
                            var dB = (0.5 * Math.pow($__getByIdOffset(shadowInfo, "shape", 2).material.transparency, 0.5));
                            color = Flog.RayTracer.Color.prototype.addScalar(vA, dB);
                        }
                    }
                    // Phong specular highlights
                    if ($__getByIdOffset(this, "options", 0).renderHighlights && !$__getByIdOffset(shadowInfo, "isHit", 0) && $__getByIdOffset(info, "shape", 2).material.gloss > 0) {
                        var Lv = Flog.RayTracer.Vector.prototype.subtract($__getByIdOffset(info, "shape", 2).position, $__getByIdOffset(light, "position", 0)).normalize();
                        var E = Flog.RayTracer.Vector.prototype.subtract($__getByIdOffset($__getByIdOffset(scene, "camera", 0), "position", 0), $__getByIdOffset(info, "shape", 2).position).normalize();
                        var H = Flog.RayTracer.Vector.prototype.subtract(E, Lv).normalize();
                        var glossWeight = Math.pow(Math.max($__getByIdOffset(info, "normal", 4).dot(H), 0), shininess);
                        color = Flog.RayTracer.Color.prototype.add(Flog.RayTracer.Color.prototype.multiplyScalar($__getByIdOffset(light, "color", 1), glossWeight), color);
                    }
                }
                color.limit();
                return color;
            }
        }
        RayTracer.Engine = Engine;
    })(RayTracer = Flog.RayTracer || (Flog.RayTracer = {}));
})(Flog || (Flog = {}));
function renderScene() {
    var scene = new Flog.RayTracer.Scene();
    scene.camera = new Flog.RayTracer.Camera(new Flog.RayTracer.Vector(0, 0, -15), new Flog.RayTracer.Vector(-0.2, 0, 5), new Flog.RayTracer.Vector(0, 1, 0));
    scene.background = new Flog.RayTracer.Background(new Flog.RayTracer.Color(0.5, 0.5, 0.5), 0.4);
    var sphere = new Flog.RayTracer.Shape.Sphere(new Flog.RayTracer.Vector(-1.5, 1.5, 2), 1.5, new Flog.RayTracer.Material.Solid(new Flog.RayTracer.Color(0, 0.5, 0.5), 0.3, 0.0, 0.0, 2.0));
    var sphere1 = new Flog.RayTracer.Shape.Sphere(new Flog.RayTracer.Vector(1, 0.25, 1), 0.5, new Flog.RayTracer.Material.Solid(new Flog.RayTracer.Color(0.9, 0.9, 0.9), 0.1, 0.0, 0.0, 1.5));
    var plane = new Flog.RayTracer.Shape.Plane(new Flog.RayTracer.Vector(0.1, 0.9, -0.5).normalize(), 1.2, new Flog.RayTracer.Material.Chessboard(new Flog.RayTracer.Color(1, 1, 1), new Flog.RayTracer.Color(0, 0, 0), 0.2, 0.0, 1.0, 0.7));
    $__getByIdOffset(scene, "shapes", 1).push(plane);
    $__getByIdOffset(scene, "shapes", 1).push(sphere);
    $__getByIdOffset(scene, "shapes", 1).push(sphere1);
    var light = new Flog.RayTracer.Light(new Flog.RayTracer.Vector(5, 10, -1), new Flog.RayTracer.Color(0.8, 0.8, 0.8));
    var light1 = new Flog.RayTracer.Light(new Flog.RayTracer.Vector(-3, 5, -15), new Flog.RayTracer.Color(0.8, 0.8, 0.8), 100);
    $__getByIdOffset(scene, "lights", 2).push(light);
    $__getByIdOffset(scene, "lights", 2).push(light1);
    var imageWidth = 100; // $F('imageWidth');
    var imageHeight = 100; // $F('imageHeight');
    var pixelSize = "5,5".split(','); //  $F('pixelSize').split(',');
    var renderDiffuse = true; // $F('renderDiffuse');
    var renderShadows = true; // $F('renderShadows');
    var renderHighlights = true; // $F('renderHighlights');
    var renderReflections = true; // $F('renderReflections');
    var rayDepth = 2; //$F('rayDepth');
    var raytracer = new Flog.RayTracer.Engine({
        canvasWidth: imageWidth,
        canvasHeight: imageHeight,
        pixelWidth: Number(pixelSize[0]),
        pixelHeight: Number(pixelSize[1]),
        "renderDiffuse": renderDiffuse,
        "renderHighlights": renderHighlights,
        "renderShadows": renderShadows,
        "renderReflections": renderReflections,
        "rayDepth": rayDepth
    });
    raytracer.renderScene(scene, null);
}
function runIteration() {
    for (let i = 0; i < 20; ++i)
        renderScene();
}
runIteration();
