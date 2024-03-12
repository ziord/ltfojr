let checkNumber: number;

/* Fake a Flog.* namespace */
namespace Flog {
    export namespace RayTracer {
        export class Color {
            red: number;
            green: number;
            blue: number;

            constructor(r: number, g: number, b: number) {
                this.red = r || 0.0;
                this.green = g || 0.0;
                this.blue = b || 0.0;
            }

            add(c1: Color, c2: Color): Color {
                const result = new Color(0, 0, 0);
                result.red = c1.red + c2.red;
                result.green = c1.green + c2.green;
                result.blue = c1.blue + c2.blue;
                return result;
            }

            addScalar(c1: Color, s: number): Color {
                const result = new Color(0, 0, 0);
                result.red = c1.red + s;
                result.green = c1.green + s;
                result.blue = c1.blue + s;
                result.limit();
                return result;
            }

            subtract(c1: Color, c2: Color): Color {
                const result = new Color(0, 0, 0);
                result.red = c1.red - c2.red;
                result.green = c1.green - c2.green;
                result.blue = c1.blue - c2.blue;
                return result;
            }

            multiply(c1: Color, c2: Color): Color {
                const result = new Color(0, 0, 0);
                result.red = c1.red * c2.red;
                result.green = c1.green * c2.green;
                result.blue = c1.blue * c2.blue;
                return result;
            }

            multiplyScalar(c1: Color, f: number): Color {
                const result = new Color(0, 0, 0);
                result.red = c1.red * f;
                result.green = c1.green * f;
                result.blue = c1.blue * f;
                return result;
            }

            divideFactor(c1: Color, f: number): Color {
                const result = new Color(0, 0, 0);
                result.red = c1.red / f;
                result.green = c1.green / f;
                result.blue = c1.blue / f;
                return result;
            }

            limit(): void {
                this.red = (this.red > 0.0) ? ((this.red > 1.0) ? 1.0 : this.red) : 0.0;
                this.green = (this.green > 0.0) ? ((this.green > 1.0) ? 1.0 : this.green) : 0.0;
                this.blue = (this.blue > 0.0) ? ((this.blue > 1.0) ? 1.0 : this.blue) : 0.0;
            }

            distance(color: Color): number {
                const d = Math.abs(this.red - color.red) + Math.abs(this.green - color.green) + Math.abs(this.blue - color.blue);
                return d;
            }

            blend(c1: Color, c2: Color, w: number): Color {
                let result = new Color(0, 0, 0);
                result = Flog.RayTracer.Color.prototype.add(
                    Flog.RayTracer.Color.prototype.multiplyScalar(c1, 1 - w),
                    Flog.RayTracer.Color.prototype.multiplyScalar(c2, w)
                  );
                return result;
            }

            brightness(): number {
                const r = Math.floor(this.red * 255);
                const g = Math.floor(this.green * 255);
                const b = Math.floor(this.blue * 255);
                return (r * 77 + g * 150 + b * 29) >> 8;
            }

            toString(): string {
                const r = Math.floor(this.red * 255);
                const g = Math.floor(this.green * 255);
                const b = Math.floor(this.blue * 255);
                return "rgb(" + r + "," + g + "," + b + ")";
            }
        }

        export class Light {
            position: Vector;
            color: Color;
            intensity: number;

            constructor(pos: Vector, color: Color, intensity?: number) {
                this.position = pos;
                this.color = color;
                this.intensity = intensity || 10.0;
            }

            toString(): string {
                return 'Light [' + this.position.x + ',' + this.position.y + ',' + this.position.z + ']';
            }
        }

        export class Vector {
            x: number;
            y: number;
            z: number;

            constructor(x?: number, y?: number, z?: number) {
                this.x = (x ? x : 0);
                this.y = (y ? y : 0);
                this.z = (z ? z : 0);
            }

            copy(vector: Vector): void {
                this.x = vector.x;
                this.y = vector.y;
                this.z = vector.z;
            }

            normalize(): Vector {
                const m = this.magnitude();
                return new Vector(this.x / m, this.y / m, this.z / m);
            }

            magnitude(): number {
                return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
            }

            cross(w: Vector): Vector {
                return new Vector(
                    -this.z * w.y + this.y * w.z,
                    this.z * w.x - this.x * w.z,
                    -this.y * w.x + this.x * w.y
                );
            }

            dot(w: Vector): number {
                return this.x * w.x + this.y * w.y + this.z * w.z;
            }

            add(v: Vector, w: Vector): Vector {
                return new Vector(w.x + v.x, w.y + v.y, w.z + v.z);
            }

            subtract(v: Vector, w: Vector): Vector {
                if (!w || !v) throw 'Vectors must be defined [' + v + ',' + w + ']';
                return new Vector(v.x - w.x, v.y - w.y, v.z - w.z);
            }

            multiplyVector(v: Vector, w: Vector): Vector {
                return new Vector(v.x * w.x, v.y * w.y, v.z * w.z);
            }

            multiplyScalar(v: Vector, w: number): Vector {
                return new Vector(v.x * w, v.y * w, v.z * w);
            }

            toString(): string {
                return 'Vector [' + this.x + ',' + this.y + ',' + this.z + ']';
            }
        }

        export class Ray {
            position: Vector;
            direction: Vector;

            constructor(pos: Vector, dir: Vector) {
                this.position = pos;
                this.direction = dir;
            }

            toString(): string {
                return 'Ray [' + this.position + ',' + this.direction + ']';
            }
        }

        export class Background {
            constructor(public color: Color, public ambience: number) {}
        }

        type _Shape = (Shape.Sphere | Shape.Plane);

        export class Scene {
            camera : Camera;
            shapes : _Shape[];
            lights: Light[];
            background : Background;

            constructor() {
                this.camera = new Camera(
                    new Flog.RayTracer.Vector(0,0,-5),
                    new Flog.RayTracer.Vector(0,0,1),
                    new Flog.RayTracer.Vector(0,1,0)
                );
                this.shapes = new Array();
                this.lights = new Array();
                this.background = new Background(new Color(0,0,0.5), 0.2);
            }
        }

        export namespace Material {
            export class BaseMaterial {
                gloss: number = 2.0;
                transparency: number = 0.0;
                reflection: number = 0.0;
                refraction: number = 0.50;
                hasTexture: boolean = false;
                constructor() {
                }

                getColor(u: any, v: any): Color {
                    return (undefined as any);
                }

                wrapUp(t: number) {
                    t = t % 2.0;
                    if(t < -1) t += 2.0;
                    if(t >= 1) t -= 2.0;
                    return t;
                }
    
                toString(): string {
                    return 'Material [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture +']';
                }
            }

            export class Solid extends BaseMaterial {
                constructor(
                    public color: Color,
                    public reflection: number,
                    public refraction: number,
                    public transparency: number,
                    public gloss: number
                ) {
                    super();
                }

                getColor(u: any, v: any) {
                    return this.color;
                }

                toString() {
                    return 'SolidMaterial [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture +']';
                }
            }

            export class Chessboard extends BaseMaterial {
                constructor(
                    public colorEven: Color,
                    public colorOdd: Color,
                    public reflection: number,
                    public transparency: number,
                    public gloss: number,
                    public density: number,
                ) {
                    super();
                    this.hasTexture = true;
                }

                getColor(u: any, v: any) {
                    const t = this.wrapUp(u * this.density) * this.wrapUp(v * this.density);

                    if (t < 0.0)
                        return this.colorEven;
                    else
                        return this.colorOdd;
                }

                toString() {
                    return 'ChessMaterial [gloss=' + this.gloss + ', transparency=' + this.transparency + ', hasTexture=' + this.hasTexture +']';
                }
            }
        }

        export namespace Shape {
            export class Sphere {
    
                constructor(public position: Vector, public radius: number, public material: Material.BaseMaterial) {
                }

                intersect(ray: Ray) {
                    var info = new Flog.RayTracer.IntersectionInfo();
                    info.shape = this;

                    var dst = Flog.RayTracer.Vector.prototype.subtract(ray.position, this.position);

                    var B = dst.dot(ray.direction);
                    var C = dst.dot(dst) - (this.radius * this.radius);
                    var D = (B * B) - C;

                    if(D > 0){ // intersection!
                        info.isHit = true;
                        info.distance = (-B) - Math.sqrt(D);
                        info.position = Flog.RayTracer.Vector.prototype.add(
                                                            ray.position,
                                                            Flog.RayTracer.Vector.prototype.multiplyScalar(
                                                                ray.direction,
                                                                info.distance
                                                            )
                                                        );
                        info.normal = Flog.RayTracer.Vector.prototype.subtract(
                                                        info.position,
                                                        this.position
                                                    ).normalize();

                        info.color = this.material.getColor(0,0);
                    } else {
                        info.isHit = false;
                    }
                    return info;
                }
    
                toString(): string {
                    return 'Sphere [position=' + this.position + ', radius=' + this.radius + ']';
                }
            }
    
            export class Plane {
                constructor(public position: Vector, public d: number, public material: Material.BaseMaterial) {
                }

                intersect(ray: Ray) {
                    var info = new Flog.RayTracer.IntersectionInfo();

                    var Vd = this.position.dot(ray.direction);
                    if(Vd == 0) return info; // no intersection

                    var t = -(this.position.dot(ray.position) + this.d) / Vd;
                    if(t <= 0) return info;

                    info.shape = this;
                    info.isHit = true;
                    info.position = Flog.RayTracer.Vector.prototype.add(
                                                        ray.position,
                                                        Flog.RayTracer.Vector.prototype.multiplyScalar(
                                                            ray.direction,
                                                            t
                                                        )
                                                    );
                    info.normal = this.position;
                    info.distance = t;

                    if(this.material.hasTexture) {
                        var vU = new Flog.RayTracer.Vector(this.position.y, this.position.z, -this.position.x);
                        var vV = vU.cross(this.position);
                        var u = info.position.dot(vU);
                        var v = info.position.dot(vV);
                        info.color = this.material.getColor(u,v);
                    } else {
                        info.color = this.material.getColor(0,0);
                    }

                    return info;
                }
    
                toString(): string {
                    return 'Plane [' + this.position + ', d=' + this.d + ']';
                }
            }
        }

        export class IntersectionInfo {
            isHit: boolean = false;
            hitCount = 0;
            shape:any = null;
            position: Vector | null = null;
            normal: Vector | null = null;
            color: Color | undefined;
            distance: number | null = null;

            constructor() {
                this.color = new Flog.RayTracer.Color(0,0,0);
            }

            toString(): string {
                return 'Intersection [' + this.position + ']';
            }
        }

        export class Camera {
            position: Vector;
            lookAt: Vector;
            equator: Vector;
            up: Vector;
            screen: Vector;

            constructor(pos: Vector, lookAt: Vector, up: Vector) {
                this.position = pos;
                this.lookAt = lookAt;
                this.up = up;
                this.equator = lookAt.normalize().cross(up);
                this.screen = Flog.RayTracer.Vector.prototype.add(this.position, this.lookAt);
            }

            getRay(vx: number, vy: number){
                var pos = Flog.RayTracer.Vector.prototype.subtract(
                    this.screen,
                    Flog.RayTracer.Vector.prototype.subtract(
                        Flog.RayTracer.Vector.prototype.multiplyScalar(this.equator, vx),
                        Flog.RayTracer.Vector.prototype.multiplyScalar(this.up, vy)
                    )
                );
                pos.y = pos.y * -1;
                var dir = Flog.RayTracer.Vector.prototype.subtract(
                    pos,
                    this.position
                );
        
                var ray = new Flog.RayTracer.Ray(pos, dir.normalize());
        
                return ray;
            }

            toString(): string {
                return 'Ray []';
            }
        }

        interface EngineOptions {
            canvasHeight: number,
            canvasWidth: number,
            pixelWidth: number,
            pixelHeight: number,
            renderDiffuse: boolean,
            renderShadows: boolean,
            renderHighlights: boolean,
            renderReflections: boolean,
            rayDepth: number,
        }

        export class Engine {
            options: EngineOptions;
            canvas: any = null;
            constructor(options: EngineOptions | undefined) {
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

            setPixel(x: any, y: any, color: Color): void {
                var pxW, pxH;
                pxW = this.options.pixelWidth;
                pxH = this.options.pixelHeight;
        
                if (this.canvas) {
                  this.canvas.fillStyle = color.toString();
                  this.canvas.fillRect(x * pxW, y * pxH, pxW, pxH);
                } else {
                  if (x ===  y) {
                    checkNumber += color.brightness();
                  }
                  // print(x * pxW, y * pxH, pxW, pxH);
                }
            }

            renderScene(scene: Scene, canvas: any) {
                checkNumber = 0;
                /* Get canvas */
                if (canvas) {
                  this.canvas = canvas.getContext("2d");
                } else {
                  this.canvas = null;
                }
        
                var canvasHeight = this.options.canvasHeight;
                var canvasWidth = this.options.canvasWidth;
        
                for(var y=0; y < canvasHeight; y++){
                    for(var x=0; x < canvasWidth; x++){
                        var yp = y * 1.0 / canvasHeight * 2 - 1;
                          var xp = x * 1.0 / canvasWidth * 2 - 1;
        
                          var ray = scene.camera.getRay(xp, yp);
        
                          var color = this.getPixelColor(ray, scene);
        
                        this.setPixel(x, y, color!);
                    }
                }
                if (checkNumber !== 2321) {
                  throw new Error("Scene rendered incorrectly");
                }
            }

            getPixelColor(ray: Ray, scene: Scene) {
                var info = this.testIntersection(ray, scene, null);
                if(info.isHit){
                    var color = this.rayTrace(info, ray, scene, 0);
                    return color;
                }
                return scene.background.color;
            }
        
            testIntersection(ray: Ray, scene: Scene, exclude: _Shape | null) {
                var hits = 0;
                var best = new Flog.RayTracer.IntersectionInfo();
                best.distance = 2000;
        
                for(var i=0; i<scene.shapes.length; i++){
                    var shape = scene.shapes[i];
        
                    if(shape != exclude){
                        var info = (shape as Shape.Plane).intersect(ray);
                        if(info.isHit && info.distance! >= 0 && info.distance! < best.distance!){
                            best = info;
                            hits++;
                        }
                    }
                }
                best.hitCount = hits;
                return best;
            }
        
            getReflectionRay(P: Vector, N: Vector, V: Vector) {
                var c1 = -N.dot(V);
                var R1 = Flog.RayTracer.Vector.prototype.add(
                    Flog.RayTracer.Vector.prototype.multiplyScalar(N, 2*c1),
                    V
                );
                return new Flog.RayTracer.Ray(P, R1);
            }

            rayTrace(info: IntersectionInfo, ray: Ray, scene: Scene, depth: number) {
                // Calc ambient
                var color = Flog.RayTracer.Color.prototype.multiplyScalar(info.color!, scene.background.ambience);
                var oldColor = color;
                var shininess = Math.pow(10, info.shape.material.gloss + 1);
        
                for(var i=0; i<scene.lights.length; i++){
                    var light = scene.lights[i];
        
                    // Calc diffuse lighting
                    var v = Flog.RayTracer.Vector.prototype.subtract(
                                        light.position,
                                        info.position!
                                    ).normalize();
        
                    if(this.options.renderDiffuse){
                        var L = v.dot(info.normal!);
                        if(L > 0.0){
                            color = Flog.RayTracer.Color.prototype.add(
                                                color,
                                                Flog.RayTracer.Color.prototype.multiply(
                                                    info.color!,
                                                    Flog.RayTracer.Color.prototype.multiplyScalar(
                                                        light.color,
                                                        L
                                                    )
                                                )
                                            );
                        }
                    }
        
                    // The greater the depth the more accurate the colours, but
                    // this is exponentially (!) expensive
                    if(depth <= this.options.rayDepth){
                  // calculate reflection ray
                  if(this.options.renderReflections && info.shape.material.reflection > 0)
                  {
                      var reflectionRay = this.getReflectionRay(info.position!, info.normal!, ray.direction);
                      var refl = this.testIntersection(reflectionRay, scene, info.shape);
        
                      if (refl.isHit && refl.distance! > 0){
                          refl.color = this.rayTrace(refl, reflectionRay, scene, depth + 1);
                      } else {
                          refl.color = scene.background.color!;
                                }
        
                          color = Flog.RayTracer.Color.prototype.blend(
                            color,
                            refl.color,
                            info.shape.material.reflection
                          );
                  }
        
                        // Refraction
                        /* TODO */
                    }
        
                    /* Render shadows and highlights */
        
                    var shadowInfo = new Flog.RayTracer.IntersectionInfo();
        
                    if(this.options.renderShadows){
                        var shadowRay = new Flog.RayTracer.Ray(info.position!, v);
        
                        shadowInfo = this.testIntersection(shadowRay, scene, info.shape);
                        if(shadowInfo.isHit && shadowInfo.shape != info.shape /*&& shadowInfo.shape.type != 'PLANE'*/){
                            var vA = Flog.RayTracer.Color.prototype.multiplyScalar(color, 0.5);
                            var dB = (0.5 * Math.pow(shadowInfo.shape.material.transparency, 0.5));
                            color = Flog.RayTracer.Color.prototype.addScalar(vA,dB);
                        }
                    }
        
              // Phong specular highlights
              if(this.options.renderHighlights && !shadowInfo.isHit && info.shape.material.gloss > 0){
                var Lv = Flog.RayTracer.Vector.prototype.subtract(
                                    info.shape.position,
                                    light.position
                                ).normalize();
        
                var E = Flog.RayTracer.Vector.prototype.subtract(
                                    scene.camera.position,
                                    info.shape.position
                                ).normalize();
        
                var H = Flog.RayTracer.Vector.prototype.subtract(
                                    E,
                                    Lv
                                ).normalize();
        
                var glossWeight = Math.pow(Math.max(info.normal!.dot(H), 0), shininess);
                color = Flog.RayTracer.Color.prototype.add(
                                    Flog.RayTracer.Color.prototype.multiplyScalar(light.color, glossWeight),
                                    color
                                );
              }
                }
                color.limit();
                return color;
            }
        }
    }
}


function renderScene(){
    var scene = new Flog.RayTracer.Scene();

    scene.camera = new Flog.RayTracer.Camera(
                        new Flog.RayTracer.Vector(0, 0, -15),
                        new Flog.RayTracer.Vector(-0.2, 0, 5),
                        new Flog.RayTracer.Vector(0, 1, 0)
                    );

    scene.background = new Flog.RayTracer.Background(
                                new Flog.RayTracer.Color(0.5, 0.5, 0.5),
                                0.4
                            );

    var sphere = new Flog.RayTracer.Shape.Sphere(
        new Flog.RayTracer.Vector(-1.5, 1.5, 2),
        1.5,
        new Flog.RayTracer.Material.Solid(
            new Flog.RayTracer.Color(0,0.5,0.5),
            0.3,
            0.0,
            0.0,
            2.0
        )
    );

    var sphere1 = new Flog.RayTracer.Shape.Sphere(
        new Flog.RayTracer.Vector(1, 0.25, 1),
        0.5,
        new Flog.RayTracer.Material.Solid(
            new Flog.RayTracer.Color(0.9,0.9,0.9),
            0.1,
            0.0,
            0.0,
            1.5
        )
    );

    var plane = new Flog.RayTracer.Shape.Plane(
                                new Flog.RayTracer.Vector(0.1, 0.9, -0.5).normalize(),
                                1.2,
                                new Flog.RayTracer.Material.Chessboard(
                                    new Flog.RayTracer.Color(1,1,1),
                                    new Flog.RayTracer.Color(0,0,0),
                                    0.2,
                                    0.0,
                                    1.0,
                                    0.7
                                )
                            );

    scene.shapes.push(plane);
    scene.shapes.push(sphere);
    scene.shapes.push(sphere1);

    var light = new Flog.RayTracer.Light(
        new Flog.RayTracer.Vector(5, 10, -1),
        new Flog.RayTracer.Color(0.8, 0.8, 0.8)
    );

    var light1 = new Flog.RayTracer.Light(
        new Flog.RayTracer.Vector(-3, 5, -15),
        new Flog.RayTracer.Color(0.8, 0.8, 0.8),
        100
    );

    scene.lights.push(light);
    scene.lights.push(light1);

    var imageWidth = 100; // $F('imageWidth');
    var imageHeight = 100; // $F('imageHeight');
    var pixelSize = "5,5".split(','); //  $F('pixelSize').split(',');
    var renderDiffuse = true; // $F('renderDiffuse');
    var renderShadows = true; // $F('renderShadows');
    var renderHighlights = true; // $F('renderHighlights');
    var renderReflections = true; // $F('renderReflections');
    var rayDepth = 2;//$F('rayDepth');

    var raytracer = new Flog.RayTracer.Engine(
        {
            canvasWidth: imageWidth,
            canvasHeight: imageHeight,
            pixelWidth: Number(pixelSize[0]),
            pixelHeight: Number(pixelSize[1]),
            "renderDiffuse": renderDiffuse,
            "renderHighlights": renderHighlights,
            "renderShadows": renderShadows,
            "renderReflections": renderReflections,
            "rayDepth": rayDepth
        }
    );

    raytracer.renderScene(scene, null);
}

function runIteration() { 
    for (let i = 0; i < 20; ++i)
        renderScene();
}

runIteration();