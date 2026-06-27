<script setup lang="ts">
import { ref } from 'vue'
import { useParticleField } from '../composables/useParticleField'

defineProps<{
  reduced: boolean
}>()

const canvasRef = ref<HTMLCanvasElement>()

// Always call composable; it self-guards when canvasRef is null (v-if="!reduced")
useParticleField(canvasRef)
</script>

<template>
  <!-- Not mounted at all when reduced motion is preferred -->
  <canvas
    v-if="!reduced"
    ref="canvasRef"
    class="particle-canvas"
    aria-hidden="true"
  />
</template>

<style scoped>
.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: var(--z-particles);
}
</style>
