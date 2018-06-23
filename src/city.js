import * as THREE from 'three'
import Stats from 'stats.js'
import OrbitControls from 'three-orbit-controls'

import snow1 from './images/snowflake1.png'
import snow2 from './images/snowflake2.png'
import snow3 from './images/snowflake3.png'
import snow4 from './images/snowflake5.png'

const orbitControls = OrbitControls(THREE);
class GAME {
    constructor() {
        this.stats = null; // 性能监听器

        // 场景、相机、渲染器
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        // 额外元素
        this.light = null;
        this.controls = null;
        this.clock = null;
        this.raycaster = null;
        this.mouse = null;
        this.platform = null;

        // 车
        this.car = null;
        this.head = 0;
        this.count = 0;
        this.position = {};
    }

    // 设置性能监听器
    setStats() {
        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute';
        this.stats.domElement.style.left = '';
        this.stats.domElement.style.right = '0px';
        this.stats.domElement.style.top = '0px';
        document.body.appendChild(this.stats.domElement);
    }

    // 创建渲染器
    createRenderer() {
        // 渲染器
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xeeeeee);
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.soft = true;
        document.body.appendChild(this.renderer.domElement);
    }
    // 创建场景
    createScene() {
        this.scene = new THREE.Scene();
    }
    // 创建相机
    createCamera() {
        // 透视相机
        this.camera = new THREE.PerspectiveCamera(
            45, // 视场角度
            this.renderer.domElement.width / this.renderer.domElement.height, // 长宽比
            0.1,
            10000
        );
        // 正投影相机
        // this.camera = new THREE.OrthographicCamera(
        //     -100,
        //     100,
        //     -100,
        //     100,
        //     0.1,
        //     10000
        // );
        this.camera.position.set(100, 100, 100);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
    }

    // 创建灯光
    createLight() {
        // 创建环境光
        this.scene.add(new THREE.AmbientLight('#111111'));

        let hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
        hemiLight.position.set(0, 500, 0);
        hemiLight.visible = false;
        this.scene.add(hemiLight);

        // 创建太阳光
        this.light = new THREE.DirectionalLight('#ffffff');
        this.light.position.set(-50, 80, -30);
        this.light.castShadow = true;
        this.light.shadow.camera.near = 2;
        this.light.shadow.camera.far = 3000;
        this.light.shadow.camera.left = -500;
        this.light.shadow.camera.right = 500;
        this.light.shadow.camera.top = 500;
        this.light.shadow.camera.bottom = -500;

        this.light.distance = 0;
        this.light.intensity = 0.8;
        this.light.shadow.mapSize.height = 1024;
        this.light.shadow.mapSize.width = 1024;

        this.scene.add(this.light);
    }

    // 创建路面和地基
    createPlatform() {
        // 创建路面
        this.platform = new THREE.Mesh(
            new THREE.PlaneGeometry(520, 520),
            new THREE.MeshLambertMaterial({
                color: 0x4A4A4A,
                emissive: 0x4A4A4A,
            })
        );
        this.platform.name = 'platform';
        this.platform.rotation.x = -0.5 * Math.PI;
        this.platform.receiveShadow = true;

        this.scene.add(this.platform);

        // 创建地基
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 5; j++) {
                let groundWork = new THREE.Mesh(
                    new THREE.CubeGeometry(80, 2, 80),
                    new THREE.MeshLambertMaterial({
                        color: 0xF4F4F4,
                        emissive: 0xE0E0E0,
                    })
                );
                groundWork.name = `groundWork-${i}-${j}`;
                groundWork.position.x = -260 + i * (20 + 40) + (i - 1) * 40;
                groundWork.position.y = 1;
                groundWork.position.z = -260 + j * (20 + 40) + (j - 1) * 40;
                groundWork.castShadow = true;
                groundWork.receiveShadow = true;
                this.scene.add(groundWork);
            }
        }
    }

    // 创建房屋
    createHouse() {
        for (let i = 1; i <= 5; i++) {
            for (let j = 1; j <= 5; j++) {
                let randomHeight = Math.floor(60 * Math.random() + 30);
                let house = new THREE.Mesh(
                    new THREE.CubeGeometry(60, randomHeight, 60),
                    new THREE.MeshLambertMaterial({
                        color: 0xF4A460,
                        emissive: 0xF4A460,
                    })
                );
                house.name = `house-${i}-${j}`;
                house.position.x = -260 + i * (20 + 40) + (i - 1) * 40;
                house.position.y = randomHeight / 2 + 2;
                house.position.z = -260 + j * (20 + 40) + (j - 1) * 40;
                house.castShadow = true;
                house.receiveShadow = true;
                this.scene.add(house);
            }
        }
    }

    createTrafficLine() {
        return;
        let line = new THREE.Mesh(
            new THREE.PlaneGeometry(2, 15),
            new THREE.MeshLambertMaterial({
                color: 0xE0E0E0,
                emissive: 0xE0E0E0,
            })
        );
        line.name = 'trafficLine-';
        line.rotation.x = -0.5 * Math.PI;
        line.position.x = 50;
        line.position.y = 0.1;
        line.receiveShadow = true;

        this.scene.add(line);
    }

    createCar(id) {
        let material = new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            // emissive: 0xFF0000,
            specular: 0xFF0000,
            shininess: 500,
        });

        // 创建自定义几何体
        let carTopGeometry = new THREE.Geometry();
        let vertices = [
            new THREE.Vector3(1, 1, 1),
            new THREE.Vector3(1, 1, -1),
            new THREE.Vector3(2, -1, 3),
            new THREE.Vector3(2, -1, -3),
            new THREE.Vector3(-1, 1, -1),
            new THREE.Vector3(-1, 1, 1),
            new THREE.Vector3(-2, -1, -3),
            new THREE.Vector3(-2, -1, 3)
        ];
        let faces = [
            new THREE.Face3(0, 2, 1),
            new THREE.Face3(2, 3, 1),
            new THREE.Face3(4, 6, 5),
            new THREE.Face3(6, 7, 5),
            new THREE.Face3(4, 5, 1),
            new THREE.Face3(5, 0, 1),
            new THREE.Face3(7, 6, 2),
            new THREE.Face3(6, 3, 2),
            new THREE.Face3(5, 7, 0),
            new THREE.Face3(7, 2, 0),
            new THREE.Face3(1, 3, 4),
            new THREE.Face3(3, 6, 4),
        ];
        carTopGeometry.vertices = vertices;
        carTopGeometry.faces = faces;
        let carTop = new THREE.Mesh(
            carTopGeometry,
            material
        );
        carTop.position.y = 2;
        carTop.castShadow = true;

        let carBottom = new THREE.Mesh(
            new THREE.CubeGeometry(5, 2, 10),
            material
        );
        carBottom.castShadow = true;

        this.car = new THREE.Object3D();
        this.car.name = `car-${id}`;
        this.car.add(carTop);
        this.car.add(carBottom);
        this.car.position.y = 4;
        this.car.position.x = 50;
        this.car.castShadow = true;

        this.scene.add(this.car);
        this.head = 0;
        this.position = [50, 4, 0];
        // this.scene.add(new THREE.Mesh(
        //     new THREE.PolyhedronGeometry(vertices, faces, 10, 0),
        //     material
        // ));

    }

    driveCars() {
        let position = this.car.position;

        switch (this.head) {
            // 北
            case 0:
                this.car.position.z = (+position.z - 0.5).toFixed(1);
                break;
                // 东 
            case 1:
                this.car.position.x = (+position.x + 0.5).toFixed(1);
                break;
                // 南
            case 2:
                this.car.position.z = (+position.z + 0.5).toFixed(1);
                break;
                // 西
            case 3:
                this.car.position.x = (+position.x - 0.5).toFixed(1);
                break;
        }
        let direction = this.solveDircetion();
        if (this.head != direction) {
            this.car.rotation.y += 0.5 * Math.PI;
            this.head = direction;
        }
    }

    solveDircetion() {
        let border = [-250, -150, -50, 50, 150, 250],
            position = this.car.position,
            head = this.head;
        let checkValue;
        switch (head) {
            case 0:
            case 2:
                checkValue = +position.z;
                break;
            case 1:
            case 3:
                checkValue = +position.x;
                break;
        }
        let direction = [];
        // 到达路口
        if (~border.indexOf(checkValue)) {
            // 判断可转方向
            // 四个对角
            if (position.x == -250 && position.z == -250) {
                if (head = 0) {
                    direction = [1];
                } else if (head = 3) {
                    direction = [2];
                }
            } else if (position.x == 250 && position.z == -250) {
                if (head = 0) {
                    direction = [3];
                } else if (head = 1) {
                    direction = [2];
                }
            } else if (position.x == -250 && position.z == 250) {
                if (head = 3) {
                    direction = [0];
                } else if (head = 2) {
                    direction = [1];
                }
            } else if (position.x == 250 && position.z == 250) {
                if (head = 1) {
                    direction = [0];
                } else if (head = 2) {
                    direction = [3];
                }
            }
            // 四个边界
            if (position.x == -250 && Math.abs(position.z) != 250) {
                direction = [0, 1, 2];
                direction.splice([0, 1, 2].indexOf(head == 1 ? 3 : Math.abs(head - 2)), 1);
            } else if (position.x == 250 && Math.abs(position.z) != 250) {
                direction = [0, 2, 3];
                direction.splice([0, 2, 3].indexOf(head == 1 ? 3 : Math.abs(head - 2)), 1);
            } else if (position.z == -250 && Math.abs(position.x) != 250) {
                direction = [1, 2, 3];
                direction.splice([1, 2, 3].indexOf(head == 1 ? 3 : Math.abs(head - 2)), 1);
            } else if (position.z == 250 && Math.abs(position.x) != 250) {
                direction = [0, 1, 3];
                direction.splice([0, 1, 3].indexOf(head == 1 ? 3 : Math.abs(head - 2)), 1);
            }
            // 非边界
            if (Math.abs(position.x) != 250 && Math.abs(position.z) != 250) {
                direction = [0, 1, 2, 3];
                direction.splice([0, 1, 2, 3].indexOf(head == 1 ? 3 : Math.abs(head - 2)), 1);
            }
            let res = direction[Math.floor(Math.random() * direction.length)];
            // console.log(direction);
            // console.log(head, res)
            return res;
        } else {
            return head;
        }
    }

    // 创建粒子系统（下雪效果）
    createSystem(name, texture, size, transparent, opacity, sizeAttenuation, color) {
        var geom = new THREE.Geometry();

        var color = new THREE.Color(color);
        color.setHSL(color.getHSL({ h: 0, s: 0, l: 0 }).h,
            color.getHSL({ h: 0, s: 0, l: 0 }).s,
            (Math.random()) * color.getHSL({ h: 0, s: 0, l: 0 }).l);

        var material = new THREE.PointsMaterial({
            size: size,
            transparent: transparent,
            opacity: opacity,
            map: texture,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            sizeAttenuation: sizeAttenuation,
            color: color
        });

        var range = 500;
        for (var i = 0; i < 2000; i++) {
            var particle = new THREE.Vector3(
                Math.random() * range - range / 2,
                Math.random() * range * 1.5,
                Math.random() * range - range / 2);
            particle.velocityY = 0.1 + Math.random() / 5;
            particle.velocityX = (Math.random() - 0.5) / 3;
            particle.velocityZ = (Math.random() - 0.5) / 3;
            geom.vertices.push(particle);
        }

        let system = new THREE.Points(geom, material);
        system.name = name;
        system.sortParticles = true;
        return system;
    }
    createParticles() {
        let size = 3,
            transparent = true,
            opacity = 0.3,
            color = 0xffffff,
            sizeAttenuation = true;
        let loader = new THREE.TextureLoader();
        let texture1 = loader.load(snow1);
        // let texture2 = loader.load(snow2);
        // let texture3 = loader.load(snow3);
        // let texture4 = loader.load(snow4);

        this.scene.add(this.createSystem('system1', texture1, size, transparent, opacity, sizeAttenuation, color));
        // this.scene.add(this.createSystem('system2', texture2, size, transparent, opacity, sizeAttenuation, color));
        // this.scene.add(this.createSystem('system3', texture3, size, transparent, opacity, sizeAttenuation, color));
        // this.scene.add(this.createSystem('system4', texture4, size, transparent, opacity, sizeAttenuation, color));
    }
    // 飘雪效果
    snowFall() {
        this.scene.children.forEach(function(child) {
            if (child instanceof THREE.Points) {
                var vertices = child.geometry.vertices;
                vertices.forEach(function(v) {
                    v.y = v.y - (v.velocityY);
                    v.x = v.x - (v.velocityX);
                    v.z = v.z - (v.velocityZ);

                    if (v.y <= 0) v.y = 60;
                    if (v.x <= -20 || v.x >= 20) v.velocityX = v.velocityX * -1;
                    if (v.z <= -20 || v.z >= 20) v.velocityZ = v.velocityZ * -1;
                });
                child.geometry.verticesNeedUpdate = true;
            }
        });
    }

    render() {
        this.stats.update();
        let delta = this.clock.getDelta();
        this.controls.update(delta);
        this.driveCars();
        this.snowFall();
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    // 坐标轴
    createAxes() {
        let axes = new THREE.AxesHelper(20);
        this.scene.add(axes);
    }

    bindEventListener() {

    }

    init() {
        // 设置性能监听器
        this.setStats();
        
        this.createRenderer()
        this.createScene();
        this.createCamera();

        this.controls = new orbitControls(this.camera);
        // this.controls.autoRotate = true;
        this.clock = new THREE.Clock();

        this.createLight();
        // this.createAxes();
        this.createPlatform();
        this.createHouse();
        // this.createTrafficLine();
        this.createCar(0);
        this.createParticles();

        this.scene.fog = new THREE.Fog(0xffffff, 0.3, 600);

        this.render();
    }
}

export default GAME;