<template>
  <div class="back"></div>
  <div ref="sceneContainer" class="webGL"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

const sceneContainer = ref<HTMLDivElement | null>(null);

//minからmaxまでのランダムな値を返す
const randomNum = (min: number, max: number) => {
  return Math.random() * (max - min) + min
}

onMounted(() => {
  if (sceneContainer.value) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 700;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneContainer.value.appendChild(renderer.domElement);

    const starGeometry = new THREE.BufferGeometry();
    const colors = [
      1.0, 0.1, 0.1, // 
      1.0, 0.26, 0.1, // 
      1.0, 0.41, 0.1, // 
      1.0, 0.56, 0.1, // 
      1.0, 0.71, 0.1, // 
      1.0, 0.86, 0.1, // 
      0.98, 1.0, 0.1, // 
      0.1, 1.0, 0.86, //
      0.1, 0.98, 1.0, //
      0.1, 0.83, 1.0, //
      0.1, 0.68, 1.0, //
    ];
    const starCount = 3000;
    const starVertices: number[] = [];
    const starColors: number[] = [];
    const starSpeeds: number[] = [];
    const maxSpeed = 0.5;
    const minSpeed = 0.1;
    for (let i = 0; i < starCount; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      // const z = Math.random() * 2000 - 1000;
      const z = 0;
      starVertices.push(x, y, z);

      const colorIndex = Math.floor(Math.random() * colors.length) * 3;
      starColors.push(colors[colorIndex], colors[colorIndex + 1], colors[colorIndex + 2]);

      starSpeeds.push(randomNum(minSpeed, maxSpeed), randomNum(minSpeed, maxSpeed), randomNum(minSpeed, maxSpeed));
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({ size: 4, vertexColors: true });
    const stars = new THREE.Points(starGeometry, starMaterial);

    scene.add(stars);

    const starShapeVertices: number[] = [];
    const starRadius = 120;
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
    const scaleFactor = 0.8; // スケーリング値を調整
    const starRandom = 10; //表示位置のバラつき 

    window.addEventListener('click', (event) => {
      // 回転を停止
      stars.rotation.x = 0;
      stars.rotation.y = 0;

      const rect = sceneContainer.value!.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      const adjustedClickX = (clickX - rect.width / 2) * scaleFactor;
      const adjustedClickY = -(clickY - rect.height / 2) * scaleFactor;
      console.log('クリック箇所', clickX, clickY);
      console.log('クリック箇所', adjustedClickX, adjustedClickY);

      for (let i = 0; i < starCount; i += 3) {
        const index = (i / 3) % (starShapeVertices.length / 3);
        starVertices[i] = randomNum(adjustedClickX - starRandom, adjustedClickX + starRandom) + starShapeVertices[index * 3];
        starVertices[i + 1] = randomNum(adjustedClickY - starRandom, adjustedClickY + starRandom) + starShapeVertices[index * 3 + 1];
        // starVertices[i] = adjustedClickX + starShapeVertices[index * 3];
        // starVertices[i + 1] = adjustedClickY + starShapeVertices[index * 3 + 1];
        starVertices[i + 2] = starShapeVertices[index * 3 + 2];
        console.log('クリック箇所に集合', i, starVertices[i], starVertices[i + 1], starVertices[i + 2])
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

      renderer.render(scene, camera);
    };
    animate();
  }
});
</script>

<style scoped>
.webGL {
  position:fixed;
  top:0;
  left:0;
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
