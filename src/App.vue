<template>

  <div class="Stars-container" @click.once="clickScreen">
    <Suspense>
      <Stars class="Stars" :starsVisible="starsVisible" />
    </Suspense>
  </div>

  <div class="title">{{ Config.title }}</div>
  <div v-if="startAnimation" class="enter">{{ Config.txtEnter }}</div>

</template>

<script setup lang="ts">

import { ref } from 'vue';

import Stars from '@/components/Stars.vue';
import Config from '@/Config.ts'

const starsVisible = ref<boolean>(false);
const startAnimation = ref<boolean>(true);

function clickScreen() {
  if (startAnimation.value) {
    starsVisible.value = true;
    startAnimation.value = false
  }
}

</script>

<style scoped>
.Stars-container {
  position: fixed;
  inset: 0;
}

.enter {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 3vh;
  white-space: nowrap;
}

.title {
  margin-left:32px;
  margin-top:16px;
  font-size: 8vh;
}
</style>