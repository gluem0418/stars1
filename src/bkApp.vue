<template>
  <div ref="sceneContainer" class="webGL"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

import imgBack from '/img/sky1.jpg'

const sceneContainer = ref<HTMLDivElement | null>(null);

//minからmaxまでのランダムな値を返す
const randomNum = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

onMounted(() => {
  if (sceneContainer.value) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 1000);
    // const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneContainer.value.appendChild(renderer.domElement);

    const loadPic = new THREE.TextureLoader();
    const sceneTexture = loadPic.load(imgBack);
    scene.background = sceneTexture;


    const starGeometry = new THREE.BufferGeometry();
    const colors = [
      [1.0, 0.1, 0.1], // 赤
      [1.0, 0.26, 0.1], // オレンジ
      [1.0, 0.41, 0.1], // 濃いオレンジ
      [1.0, 0.56, 0.1], // 薄いオレンジ
      [1.0, 0.71, 0.1], // 黄色
      [1.0, 0.86, 0.1], // 薄い黄色
      [0.98, 1.0, 0.1], // 黄緑
      [0.1, 1.0, 0.86], // 緑
      [0.1, 0.98, 1.0], // 水色
      [0.1, 0.83, 1.0], // 青
      [0.1, 0.68, 1.0], // 濃い青
    ];
    const starCount = 2000;
    const starVertices: number[] = [];
    const starColors: number[] = [];
    const starSpeeds: number[] = [];
    const starBlinkIntervals: number[] = [];
    const starBlinkTimers: number[] = [];
    const maxSpeed = 0.5;
    const minSpeed = 0.1;

    const rect = sceneContainer.value!.getBoundingClientRect();
    const starWidth = rect.width * 1.5
    const starHeight = rect.height * 1.5

    // 背景として使用する平面を追加
    const planeGeometry = new THREE.PlaneGeometry(starWidth, starHeight);
    const planeMaterial = new THREE.MeshBasicMaterial({ visible: false });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    scene.add(plane);

    // カメラの視野角とアスペクト比を考慮して星の位置を計算
    // const fov = camera.fov * (Math.PI / 180); // 視野角をラジアンに変換
    // const aspect = rect.width / rect.height;
    // const depth = camera.position.z;

    // const vFOV = 2 * Math.tan(fov / 2) * depth; // 垂直視野
    // const hFOV = vFOV * aspect; // 水平視野

    for (let i = 0; i < starCount; i++) {
      // const x = Math.random() * 2000 - 1000;
      // const y = Math.random() * 2000 - 1000;
      const x = Math.random() * starWidth - starWidth / 2;
      const y = Math.random() * starHeight - starHeight / 2;
      // const x = (Math.random() - 0.5) * hFOV;
      // const y = (Math.random() - 0.5) * vFOV;
      const z = 0;
      starVertices.push(x, y, z);
      // console.log('starVertices', x, y, z)

      const color = colors[Math.floor(Math.random() * colors.length)];
      starColors.push(color[0], color[1], color[2]);

      starSpeeds.push(randomNum(minSpeed, maxSpeed), randomNum(minSpeed, maxSpeed), randomNum(minSpeed, maxSpeed));

      starBlinkIntervals.push(randomNum(0.5, 2.0)); // 点滅間隔をランダムに設定
      starBlinkTimers.push(0); // 初期タイマー値
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({ size: 3, sizeAttenuation: true, vertexColors: true });
    const stars = new THREE.Points(starGeometry, starMaterial);

    scene.add(stars);

    const starShapeVertices: number[] = [];
    const starRadius = 70;
    const starPoints = 5;
    for (let i = 0; i < starPoints * 2; i++) {
      const angle = (i * Math.PI) / starPoints;
      const radius = i % 2 === 0 ? starRadius : starRadius / 2;
      starShapeVertices.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0);
    }
    const mouse = new THREE.Vector2();
    window.addEventListener('mousemove', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    });

    // const halfVerticesCount = starVertices.length / 2;
    // const scaleFactorX = 1.0; // スケーリング値を調整
    // const scaleFactorY = 0.8; // スケーリング値を調整
    const scaleFactor = 0.2; // スケーリング値を調整
    const starRandom = 10; //表示位置のバラつき 
    const raycaster = new THREE.Raycaster();

    window.addEventListener('click', (event) => {
      // マウス位置を正規化
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      // レイキャスターを設定
      raycaster.setFromCamera(mouse, camera);

      // クリック位置の3D座標を取得
      const intersects = raycaster.intersectObject(plane);
      console.log('intersects', intersects)
      if (intersects.length > 0) {
        const point = intersects[0].point;
        const adjustedClickX = point.x  * scaleFactor;
        const adjustedClickY = point.y  * scaleFactor;

        console.log('raycasterPoint', point)

        // クリック位置の周辺に星を配置
        for (let i = 0; i < starCount / 2; i++) {
          const index = i % (starShapeVertices.length / 3);
          // starVertices[i * 3] = randomNum(point.x - starRandom, point.x + starRandom) + starShapeVertices[index * 3];
          // starVertices[i * 3 + 1] = randomNum(point.y - starRandom, point.y + starRandom) + starShapeVertices[index * 3 + 1];
          starVertices[i * 3] = randomNum(adjustedClickX - starRandom, adjustedClickX + starRandom) + starShapeVertices[index * 3];
          starVertices[i * 3 + 1] = randomNum(adjustedClickY - starRandom, adjustedClickY + starRandom) + starShapeVertices[index * 3 + 1];
          // starVertices[i * 3 + 2] = point.z + starShapeVertices[index * 3 + 2];
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        starGeometry.attributes.position.needsUpdate = true;
      }
    });

    const animate = () => {
      requestAnimationFrame(animate);
      // stars.position.x = mouse.x * 100;
      // stars.position.y = mouse.y * 100;
      stars.position.x = mouse.x * 300;
      stars.position.y = mouse.y * 300;

      // stars.rotation.x += 0.001;
      // stars.rotation.y += 0.001;
      const positions = starGeometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positions.length; i += 3) {
        positions[i] += starSpeeds[i];
        positions[i + 1] += starSpeeds[i + 1]
          ;
        positions[i + 2] += starSpeeds[i + 2];

        // 画面外に出たら反対側に戻す
        if (positions[i] > 1000) positions[i] = -1000;
        if (positions[i] < -1000) positions[i] = 1000;
        if (positions[i + 1] > 1000) positions[i + 1] = -1000;
        if (positions[i + 1] < -1000) positions[i + 1] = 1000;
        if (positions[i + 2] > 1000) positions[i + 2] = -1000;
        if (positions[i + 2] < -1000) positions[i + 2] = 1000;
      }

      // 点滅処理
      for (let i = 0; i < starCount; i++) {
        starBlinkTimers[i] += 0.01; // タイマーを更新
        if (starBlinkTimers[i] >= starBlinkIntervals[i]) {
          starMaterial.opacity = starMaterial.opacity === 1 ? 0 : 1; // 点滅
          starBlinkTimers[i] = 0; // タイマーをリセット
        }
      }

      starGeometry.attributes.position.needsUpdate = true;

      renderer.render(scene, camera);
    };
    animate();
  }
});
</script>

<style scoped>
.webGL {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
}

.back {
  background-image: url('/img/sky1.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 100vh;
}
</style>
