import THREE from 'three.js'
import Stats from 'stats.js'
import game from './game.js'
// window.game = new GAME('#canvas', '#status', '.result');
// game.init(20, 20, 1000, 1000);
// document.querySelector('#result button').addEventListener('click', () => {
//  game.init(20, 20, 1000, 1000);
//  document.querySelector('#result').style.display = 'none';
// });
var x,
    y,
    z;
var renderer;
var scene;
var stat;
var len = 50;
var deg = 0;
x = y = z = Math.sqrt(len * len / 2);
var cube;
var camera;
var light;

function init() {
    stat = new Stats();
    stat.domElement.style.position = 'absolute';
    stat.domElement.style.left = '';
    stat.domElement.style.right = '0px';
    stat.domElement.style.top = '0px';
    document.body.appendChild(stat.domElement);
    // renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth - 50, window.innerHeight - 50);
    document.getElementsByTagName('body')[0].appendChild(renderer.domElement);
    renderer.setClearColor(0xeeeeee); // black
    line();
    render();
    initEvent();
}

// 旋转相机（not ok）
function initEvent() {
    var test = false;
    var startPointX = 0,
        startPointY = 0;
    var startDegX, startDegY, startDegZ;
    var startDegX = startDegY = startDegZ = Math.asin(x / len);
    // startDegY = Math.acos(y / len),
    // startDegZ = Math.acos(z / len);
    var degX, degY, degZ;
    var per = 0.001;
    renderer.domElement.onmousedown = function(e) {
        test = true;
        startPointX = e.clientX;
        startPointY = e.clientY;
    }
    renderer.domElement.onmouseup = function() {
        test = false;
        startDegX = degX || Math.asin(x / len);
        startDegY = degY || Math.asin(y / len);
        startDegZ = degZ || Math.acos(z / len);
    }
    renderer.domElement.onmouseout = function() {
        test = false;
        startDegX = degX || Math.asin(x / len);
        startDegY = degY || Math.asin(y / len);
        startDegZ = degZ || Math.acos(z / len);
    }
    renderer.domElement.onmousemove = function(e) {
        if (test) {
            var disX = per * (e.clientX - startPointX),
                disY = per * (e.clientY - startPointY);
            degX = startDegX - disX;
            degY = startDegY + disY;
            x = len * Math.sin(degX);
            y = len * Math.sin(degY);
            if (Math.abs(disX) >= Math.abs(disY)) {
                degZ = startDegZ + disX;
            } else {
                degZ = startDegZ - disY;
            }
            var tempZ = len * Math.sin(degZ);
            console.log('degX:', degX, 'degY:', degY, 'x:', x, 'y:', y, 'degZ:', degZ, 'z:', tempZ);
            // z = (degX > Math.asin(Math.sqrt(len * len - y * y) / len) || degX < -Math.asin(Math.sqrt(len * len - y * y) / len)) ? -tempZ : tempZ;
            z = tempZ;
            camera.position.set(x, y, z);
            camera.lookAt(new THREE.Vector3(0, 0, 0));
            scene.add(camera);
            renderer.render(scene, camera);
        }
    }
}

// 旋转物体
// function initEvent() {
//     var test = false;
//     var startPointX = 0,
//         startPointY = 0;    
//     var per = 0.01;
//     renderer.domElement.onmousedown = function(e) {
//         test = true;
//         startPointX = e.clientX;
//         startPointY = e.clientY;
//     }
//     renderer.domElement.onmouseup = function() {
//         test = false;
//     }
//     renderer.domElement.onmouseout = function() {
//         test = false;
//     }
//     renderer.domElement.onmousemove = function(e) {
//         if (test) {
//             var disY = per * (e.clientX - startPointX),
//                 disX = per * (e.clientY - startPointY);
//             cube.rotation.x += disX * per;
//             cube.rotation.y += disY * per;
//             cube.rotation.z += (Math.abs(disX) + Math.abs(disY)) * per;
//             renderer.render(scene, camera);
//         }
//     }
// }

function line() {
    // scene
    scene = new THREE.Scene();

    var material = new THREE.LineBasicMaterial({ color: 0xFF3030 });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(100, 0, 0));
    var line = new THREE.Line(geometry, material);
    scene.add(line);

    var material = new THREE.LineBasicMaterial({ color: 0x6959CD });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 100, 0));
    var line = new THREE.Line(geometry, material);
    scene.add(line);

    var material = new THREE.LineBasicMaterial({ color: 0x8B008B });
    var geometry = new THREE.Geometry();
    geometry.vertices.push(new THREE.Vector3(0, 0, 0));
    geometry.vertices.push(new THREE.Vector3(0, 0, 100));
    var line = new THREE.Line(geometry, material);
    scene.add(line);

    for (var i = -10; i <= 10; i++) {
        var material = new THREE.LineBasicMaterial({ color: 0x00000 });
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(-11, 0.02, i));
        geometry.vertices.push(new THREE.Vector3(11, 0.02, i));
        var line = new THREE.Line(geometry, material);
        scene.add(line);

        var material = new THREE.LineBasicMaterial({ color: 0x00000 });
        var geometry = new THREE.Geometry();
        geometry.vertices.push(new THREE.Vector3(i, 0.02, -11));
        geometry.vertices.push(new THREE.Vector3(i, 0.02, 11));
        var line = new THREE.Line(geometry, material);
        scene.add(line);
    }
}

function render() {
    // camera
    // camera = new THREE.OrthographicCamera(-2, 2, 1.5, -1.5, 1, 10);
    // camera.position.set(2, 3, 5);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // scene.add(camera);

    camera = new THREE.PerspectiveCamera(30, 800 / 600, .1, 1000);
    camera.position.set(x, y, z);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(camera);

    // a cube in the scene
    cube = new THREE.Mesh(new THREE.CubeGeometry(22, 1, 22),
        new THREE.MeshLambertMaterial({
            color: 0xEE7942,
            emissive: 0xEE7942
        })
    );
    cube.position.y = -0.5;
    scene.add(cube);

    light = new THREE.DirectionalLight();
    light.position.set(30, 30, 20);
    scene.add(light);

    // render
    renderer.render(scene, camera);
    // requestAnimationFrame(rotate);
}

function rotate() {
    stat.begin();

    // deg += 0.05;
    // x = len * Math.sin(deg);
    // y = len * Math.sin(deg);
    // z = len * Math.cos(deg);
    // if (deg > 360) {
    //     deg = 0;
    // }
    // camera.position.set(x, y, z);
    // camera.lookAt(new THREE.Vector3(0, 0, 0));
    // scene.add(camera);
    // light.position.set(x, y, z);
    // scene.add(light);

    cube.rotation.x += 0.1;
    // cube.rotation.y += 0.1;
    renderer.render(scene, camera);
    requestAnimationFrame(rotate);

    stat.end();
}

export default init;