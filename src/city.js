import THREE from 'three.js'
import Stats from 'stats.js'
import OrbitControls from 'three-orbit-controls'

const orbitControls = OrbitControls(THREE);
class GAME {
    constructor() {
        this.stat = null;   // 性能监听器

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
    }
    // 设置性能监听器
    setStats() {
        this.stat = new Stats();
        this.stat.domElement.style.position = 'absolute';
        this.stat.domElement.style.left = '';
        this.stat.domElement.style.right = '0px';
        this.stat.domElement.style.top = '0px';
        document.body.appendChild(this.stat.domElement);
    }
    init() {
        // 设置性能监听器
        this.setStats();
        // 渲染器
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.setClearColor(0xeeeeee);
        this.renderer.shadowMap.enabled = true;

        this.createScene();
        this.createCamera();

        this.controls = new orbitControls(this.camera);
        // this.controls.autoRotate = true;
        this.clock = new THREE.Clock();

        this.createLight();
        // this.createAxes();
        this.createPlatform();
        // this.createCube();
        this.createCollision();
        // this.initChess('#status', '.result');
        this.createCurrentTip();
        this.render();

        document.querySelector('#result button').addEventListener('click', () => {
            for (let i = 0; i < 25; i++) {
                this.status[i] = [];
                for (let j = 0; j < 25; j++) {
                    this.status[i][j] = null;
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
    render() {
        this.stat.update();
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
                    if (this.status[position[0]][position[1]] === null) {
                        chess[0].object.material.color.setHex(this.player ? 0xffffff : 0x000000);
                        chess[0].object.material.emissive.setHex(this.player ? 0xffffff : 0x000000);
                        this.tipBox.material.opacity = 0.3;
                        this.tipBox.position.x = position[0] - 12;
                        this.tipBox.position.z = position[1] - 12;
                        // console.log(chess[0].object);
                        chess[0].object.material.opacity = 1;
                        this.status[position[0]][position[1]] = this.player;
                        if (this.judgeGameOver(position[0], position[1], 1) ||
                            this.judgeGameOver(position[0], position[1], 2) ||
                            this.judgeGameOver(position[0], position[1], 3) ||
                            this.judgeGameOver(position[0], position[1], 4)) {
                            // this.statusEl.innerHTML += (this.player ? '白棋' : '黑棋') + '胜！';
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
    // 场景
    createScene() {
        this.scene = new THREE.Scene();
    }
    // 相机
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(45, this.renderer.domElement.width / this.renderer.domElement.height, 0.1, 1000);
        this.camera.position.set(30, 40, 300);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        // this.camera.lookAt(this.scene.position);
        // this.scene.add(this.camera);
    }
    // 灯光
    createLight() {
        // this.light = new THREE.AmbientLight(0x0c0c0c);
        // this.light = new THREE.PointLight(0xccffcc);
        // this.light = new THREE.DirectionalLight(0xccffcc);
        this.light = new THREE.SpotLight(0xffffff);
        this.light.position.set(-40, 60, -10);
        this.light.castShadow = true;
        // this.light.intensity = 0.5;
        this.scene.add(this.light);
    }
    // 坐标轴
    createAxes() {
        let axes = new THREE.AxisHelper(20);
        this.scene.add(axes);
    }
    // 平台
    createPlatform() {
        this.platform = new THREE.Mesh(
            new THREE.CubeGeometry(250, 1, 250),
            new THREE.MeshLambertMaterial({
                color: 0xEE7942,
                emissive: 0xEE7942
            })
        );
        this.platform.name = 'platform';
        this.platform.position.y = -0.6;

        this.scene.add(this.platform);
    }

    createCubeTest(x, y) {
        // 画物体
        // let geometry = new THREE.CubeGeometry(0.6, 0.2, 0.6);
        let geometry = new THREE.SphereGeometry(1, 16, 16);
        let material = new THREE.MeshLambertMaterial({
            color: 0x000000,
            emissive: 0x000000,
        });
        let chess = new THREE.Mesh(geometry, material);
        chess.position.x = x;
        chess.position.y = y;
        chess.position.z = 0;
        // chess.visible = i % 3 == 0 ? true : false;
        this.scene.add(chess);
    }
}

export default GAME;