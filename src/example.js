import * as THREE from 'three'
import OrbitControls from 'three-orbit-controls'

const orbitControls = OrbitControls(THREE);
class GAME {
    constructor() {
        // 场景、相机、渲染器
        this.scene = null;
        this.camera = null;
        this.renderer = null;

        this.controls = null;
    }

    // 创建渲染器
    createRenderer() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x000000);
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
    // 创建坐标轴
    createAxes() {
        let axes = new THREE.AxesHelper(20);
        this.scene.add(axes);
    }
    // 创建物体
    createCube() {
        let cube = new THREE.Mesh(
            new THREE.CubeGeometry(50, 60, 70),
            new THREE.MeshBasicMaterial({
                color: 0xF4A460,
                wireframe: true
            })
        );
        this.scene.add(cube);
    }

    render() {
        let delta = this.clock.getDelta();
        this.controls.update(delta);
        requestAnimationFrame(this.render.bind(this));
        this.renderer.render(this.scene, this.camera);
    }

    init() {
        this.createRenderer();
        this.createScene();
        this.createCamera();

        this.createAxes();
        this.createCube();

        this.controls = new orbitControls(this.camera);
        this.clock = new THREE.Clock();

        this.render();
    }
}

export default GAME;