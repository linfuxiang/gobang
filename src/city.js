import * as THREE from 'three'
import Stats from 'stats.js'
import OrbitControls from 'three-orbit-controls'

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
        // this.scene.add(new THREE.AmbientLight('#111111'));

        // let hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 0.6);
        // hemiLight.position.set(0, 500, 0);
        // hemiLight.visible = false;
        // this.scene.add(hemiLight);

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
        let carBottom = new THREE.Mesh(
            new THREE.CubeGeometry(5, 2, 10),
            material
        );
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
            console.log(this.car.rotation)
            this.car.rotation.y += 0.5 * Math.PI;
            this.head = direction;
        }
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.driveCars.bind(this));
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
            console.log(direction);
            console.log(head, res)
            return res;
        } else {
            return head;
        }
    }

    render() {
        this.stats.update();
        let delta = this.clock.getDelta();
        this.controls.update(delta);
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    createCurrentTip() {
        // let length = this.chessmanSize / 2;
        // this.ctx.strokeStyle = isClear ? '#fff' : '#f75000';
        let geometry = new THREE.CubeGeometry(1, 1, 1);
        let material = new THREE.MeshBasicMaterial({
            color: 0x9F79EE,
        });
        material.transparent = true;
        material.opacity = 0;
        this.tipBox = new THREE.Mesh(geometry, material);
        this.scene.add(this.tipBox);
    }
    // 碰触物体
    createCollision() {
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.renderer.domElement.addEventListener('mousedown', (event) => {
            // this.firstTime = new Date().getTime();
            this.clientX = event.clientX;
            this.clientY = event.clientY;
            this.longestDis = 0;
        });
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            // this.firstTime = true;
            let dis = (event.clientX - this.clientX) ** 2 + (event.clientY - this.clientY) ** 2;
            this.longestDis = Math.max(dis, this.longestDis);
        });
        this.renderer.domElement.addEventListener('mouseup', (event) => {
            // let lastTime = new Date().getTime();
            // if ((lastTime - this.firstTime) < 500 && this.longestDis) {
            if (this.longestDis < 5) {
                this.mouse.x = (event.clientX / (window.innerWidth)) * 2 - 1;
                this.mouse.y = -(event.clientY / (window.innerHeight)) * 2 + 1;
                this.raycaster.setFromCamera(this.mouse, this.camera);
                let intersects = this.raycaster.intersectObjects(this.scene.children);
                console.log(intersects);
                let sphereIdx = false,
                    platformIdx = false;
                for (let i = 0; i < intersects.length; i++) {
                    if (!sphereIdx && intersects[i].object.geometry instanceof THREE.SphereGeometry) {
                        sphereIdx = i;
                    }
                    if (!platformIdx && intersects[i].object.name == 'platform') {
                        platformIdx = i;
                    }
                    if (sphereIdx !== false && platformIdx !== false) {
                        break;
                    }
                }
                let chess = intersects.filter(function(value) {
                    return value.object.geometry instanceof THREE.SphereGeometry;
                });
                if (sphereIdx !== false && platformIdx !== false && sphereIdx < platformIdx && chess.length == 1) {
                    // console.log(this.scene.getObjectByName('platform'));
                    let position = chess[0].object.name.split('-').map((it) => {
                        return +it;
                    });
                    // console.log(position);
                    if (this.statsus[position[0]][position[1]] === null) {
                        chess[0].object.material.color.setHex(this.player ? 0xffffff : 0x000000);
                        chess[0].object.material.emissive.setHex(this.player ? 0xffffff : 0x000000);
                        this.tipBox.material.opacity = 0.3;
                        this.tipBox.position.x = position[0] - 12;
                        this.tipBox.position.z = position[1] - 12;
                        // console.log(chess[0].object);
                        chess[0].object.material.opacity = 1;
                        this.statsus[position[0]][position[1]] = this.player;
                        if (this.judgeGameOver(position[0], position[1], 1) ||
                            this.judgeGameOver(position[0], position[1], 2) ||
                            this.judgeGameOver(position[0], position[1], 3) ||
                            this.judgeGameOver(position[0], position[1], 4)) {
                            // this.statsusEl.innerHTML += (this.player ? '白棋' : '黑棋') + '胜！';
                            document.querySelector('#result').style.display = 'block';
                            this.resultEl.innerText = (this.player ? '白棋' : '黑棋') + '胜！';
                            // this.waiting = true;
                            // setTimeout(() => {
                            // this.init(this.rowNum, this.colNum, this.row, this.col);
                            // }, 3000)
                        } else {
                            this.player = !this.player;
                        }
                    }
                }
            }
        });
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
        // 渲染器
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0xeeeeee);
        this.renderer.shadowMap.enabled = true;
        // this.renderer.shadowMap.soft = true;
        document.body.appendChild(this.renderer.domElement);

        this.createScene();
        this.createCamera();

        this.controls = new orbitControls(this.camera);
        // this.controls.autoRotate = true;
        this.clock = new THREE.Clock();

        this.createLight();
        // this.createAxes();
        this.createPlatform();
        this.createHouse();
        this.createTrafficLine();
        this.createCar(0);
        this.createCollision();
        this.createCurrentTip();

        // this.scene.fog = new THREE.Fog(0xffffff, 0.15, 300);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.15);

        this.render();
        this.driveCars();

        document.querySelector('#result button').addEventListener('click', () => {
            for (let i = 0; i < 25; i++) {
                this.statsus[i] = [];
                for (let j = 0; j < 25; j++) {
                    this.statsus[i][j] = null;
                }
            }
            this.scene.children.forEach((item, index) => {
                if (item.geometry && item.geometry instanceof THREE.SphereGeometry) {
                    item.material.opacity = 0;
                }
            });
            this.tipBox.material.opacity = 0;
            document.querySelector('#result').style.display = 'none';
        });
    }
}

export default GAME;