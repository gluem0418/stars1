<template>
  <div ref="sceneContainer" class="back"></div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as THREE from 'three';

const sceneContainer = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (sceneContainer.value) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    sceneContainer.value.appendChild(renderer.domElement);

    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 2 });
    const starVertices: number[] = [];
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 2000 - 1000;
      const y = Math.random() * 2000 - 1000;
      const z = Math.random() * 2000 - 1000;
      starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
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

    const halfVerticesCount = starVertices.length / 2;
    const scaleFactor = 0.8; // スケーリング値を調整

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

      for (let i = 0; i < halfVerticesCount; i += 3) {
        const index = (i / 3) % (starShapeVertices.length / 3);
        starVertices[i] = adjustedClickX + starShapeVertices[index * 3];
        starVertices[i + 1] = adjustedClickY + starShapeVertices[index * 3 + 1];
        starVertices[i + 2] = starShapeVertices[index * 3 + 2];

        // console.log('クリック箇所に集合', starVertices[i], starVertices[i + 1], starVertices[i + 2]);
      }
      starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
      starGeometry.attributes.position.needsUpdate = true;
    });

    const animate = () => {
      requestAnimationFrame(animate);

      stars.position.x = mouse.x * 100;
      stars.position.y = mouse.y * 100;

      stars.rotation.x += 0.001;
      stars.rotation.y += 0.001;
      renderer.render(scene, camera);
    };
    animate();
  }
});
</script>

<style scoped>
.back {
  width: 100%;
  height: 100vh;
}
</style>
