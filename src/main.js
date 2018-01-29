import THREE from 'three.js'
import Stats from 'stats.js'
// import init from './game_three.js'
// window.onload = init;
class sceneTest {
    constructor() {
        this.stat = null;
        this.renderer = null;
        this.scene = null;
        this.camera = null;
        this.light = null;
    }
    init() {
        this.stat = new Stats();
        this.stat.domElement.style.position = 'absolute';
        this.stat.domElement.style.left = '';
        this.stat.domElement.style.right = '0px';
        this.stat.domElement.style.top = '0px';
        document.body.appendChild(this.stat.domElement);
        // 渲染器
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
        document.body.appendChild(this.renderer.domElement);
        this.renderer.setClearColor(0xeeeeee);
        this.renderer.shadowMapEnabled = true;

        this.createScene();
        this.createCamera();
        this.createLight();
        this.createPlatform();
        this.createCube();
        // this.scene.fog = new THREE.Fog(0xffffff, 80, 100);
        // this.scene.fog = new THREE.FogExp2(0xffffff, 0.015);
        this.renderer.render(this.scene, this.camera);
    }
    createScene() {
        this.scene = new THREE.Scene();
    }
    createCamera() {
        this.camera = new THREE.PerspectiveCamera(45, this.renderer.domElement.width / this.renderer.domElement.height, 0.1, 1000);
        this.camera.position.set(-50, 50, 50);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));
        this.scene.add(this.camera);
    }
    createLight() {
        // this.light = new THREE.AmbientLight(0x0c0c0c);
        this.light = new THREE.PointLight(0xccffcc);
        this.light.position.set(-40, 60, -10);
        this.light.castShadow = true;
        this.scene.add(this.light);
    }
    createPlatform() {
        let platform = new THREE.Mesh(
            new THREE.CubeGeometry(22, 1, 22),
            new THREE.MeshLambertMaterial({
                color: 0xEE7942,
                emissive: 0xEE7942
            })
        );
        platform.receiveShadow = true;
        this.scene.add(platform);
    }
    createCube() {
        for (let i = 0; i < 3; i++) {
            let cubeSize = Math.ceil(Math.random() * 3);
            let cube = new THREE.Mesh(
                new THREE.CubeGeometry(cubeSize, cubeSize, cubeSize),
                new THREE.MeshLambertMaterial({
                    color: 0xAB82FF,
                    emissive: 0xAB82FF
                })
            );
            cube.castShadow = true;
            cube.name = 'cube-' + i;
            cube.position.x = -11 + Math.ceil(Math.random() * 22);
            cube.position.y = cubeSize;
            cube.position.z = -11 + Math.ceil(Math.random() * 22);
            this.scene.add(cube);
        }
    }
}
let three = new sceneTest();
three.init();