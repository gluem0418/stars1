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
    const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
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
    const starVertex = starCount * 3
    const starVertices: number[] = [];
    const starColors: number[] = [];
    const starOpacities: number[] = [];
    const starSpeeds: number[] = [];
    const starBlinkIntervals: number[] = [];
    const starBlinkTimers: number[] = [];
    const maxSpeed = 0.3;
    // const minSpeed = 0.1;
    const minSpeed = 0.1;

    const rect = sceneContainer.value!.getBoundingClientRect();
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * rect.width - rect.width / 2;
      const y = Math.random() * rect.height - rect.height / 2;
      const z = 0;
      starVertices.push(x, y, z);
      console.log('starVertices', x, y, z)

      const color = colors[Math.floor(Math.random() * colors.length)];
      starColors.push(color[0], color[1], color[2]);

      starSpeeds.push(randomNum(minSpeed, maxSpeed), randomNum(minSpeed, maxSpeed), randomNum(minSpeed, maxSpeed));

      const opacity = Math.random() > 0.5 ? 1 : 0; // 透明度を0か1に設定
      starOpacities.push(opacity); // 各星の透明度を設定
      // starBlinkIntervals.push(randomNum(0.5, 3)); // 点滅間隔をランダムに設定
      starBlinkIntervals.push(Math.random() * 1000 + 500); // 点滅間隔をランダムに設定
      starBlinkTimers.push(0); // 初期タイマー値
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));
    starGeometry.setAttribute('opacity', new THREE.Float32BufferAttribute(starOpacities, 1));
    // starGeometry.setAttribute('alpha', new THREE.Float32BufferAttribute(starOpacities, 1));

    const starMaterial = new THREE.PointsMaterial({ size: 3, sizeAttenuation: true, vertexColors: true, transparent: true, alphaTest: 0.5 });
    console.log('starMaterial', starMaterial)
    const stars = new THREE.Points(starGeometry, starMaterial);
    console.log('stars', stars)

    scene.add(stars);

    const starShapeVertices: number[] = [];
    const starRadius = 50;
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

    const scaleFactor = 0.45; // スケーリング値を調整
    const starRandom = 5; //表示位置のバラつき 

    window.addEventListener('click', (event) => {
      // 回転を停止
      stars.rotation.x = 0;
      stars.rotation.y = 0;

      // マウスの位置を正規化（-1から1の範囲）
      const clickX = (event.clientX / rect.width) * 2 - 1;
      const clickY = -(event.clientY / rect.height) * 2 + 1;
      // // スケーリング
      const adjustedClickX = clickX * (rect.width / 2) * scaleFactor;
      const adjustedClickY = clickY * (rect.height / 2) * scaleFactor;

      console.log('クリック位置', event.clientX, event.clientY);
      console.log('補正後クリック位置', clickX, clickY);
      console.log('集合箇所', adjustedClickX, adjustedClickY);

      for (let i = 0; i < starVertex / 2; i += 3) {
        const index = (i / 3) % (starShapeVertices.length / 3);
        starVertices[i] = randomNum(adjustedClickX - starRandom, adjustedClickX + starRandom) + starShapeVertices[index * 3];
        starVertices[i + 1] = randomNum(adjustedClickY - starRandom, adjustedClickY + starRandom) + starShapeVertices[index * 3 + 1];
        starVertices[i + 2] = starShapeVertices[index * 3 + 2];
      }
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      starGeometry.attributes.position.needsUpdate = true;
    });

    const animate = () => {
      requestAnimationFrame(animate);
      stars.position.x = mouse.x * 100;
      stars.position.y = mouse.y * 100;

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
      starGeometry.attributes.position.needsUpdate = true;

      // 点滅処理
      const opacities = starGeometry.attributes.opacity.array;
      // const alphas = starGeometry.attributes.alpha.array;
      for (let i = 0; i < starCount; i++) {
        starBlinkTimers[i] += 16; // タイマーを更新
        // starBlinkTimers[i] += 0.01; // タイマーを更新
        if (starBlinkTimers[i] >= starBlinkIntervals[i]) {
          // starMaterial.opacity = starMaterial.opacity === 1 ? 0 : 1; // 点滅
          // alphas[i] = alphas[i] == 1 ? 0 : 1; // 点滅
          opacities[i] = opacities[i] == 1 ? 0 : 1; // 点滅
          starBlinkTimers[i] = 0; // タイマーをリセット
          // console.log('alphas[i]', i, alphas[i])
        }
      }
      starGeometry.attributes.opacity.needsUpdate = true;
      // starGeometry.attributes.alpha.needsUpdate = true; // 透明度の更新を反映

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
</style>
