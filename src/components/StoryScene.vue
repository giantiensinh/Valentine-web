<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'
import type { StorySceneData } from '../types/index'

const props = defineProps<{
  scene: StorySceneData
  index: number
}>()

const { isReduced } = useReducedMotion()
const articleRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()

// ─── Scene configs ────────────────────────────────
interface SceneConfig {
  gradientFrom: string
  gradientTo: string
  particleChar: string
  particleHue: number
}

const SCENE_CONFIGS: SceneConfig[] = [
  // Scene 0: warm crimson — heart particles
  {
    gradientFrom: 'hsl(340, 60%, 15%)',
    gradientTo: 'hsl(310, 50%, 8%)',
    particleChar: '♥',
    particleHue: 350,
  },
  // Scene 1: purple — sparkle particles
  {
    gradientFrom: 'hsl(270, 50%, 15%)',
    gradientTo: 'hsl(240, 60%, 8%)',
    particleChar: '✦',
    particleHue: 270,
  },
  // Scene 2: blue — cherry blossom particles
  {
    gradientFrom: 'hsl(210, 60%, 15%)',
    gradientTo: 'hsl(225, 70%, 8%)',
    particleChar: '✿',
    particleHue: 320,
  },
]

const config = computed<SceneConfig>(() => SCENE_CONFIGS[props.index % SCENE_CONFIGS.length])

// ─── Lightweight canvas particles ─────────────────
interface SceneParticle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  opacityDir: number
}

let rafId: number | null = null
let sceneParticles: SceneParticle[] = []
let cw = 0
let ch = 0

function makeParticle(): SceneParticle {
  return {
    x: Math.random() * cw,
    y: Math.random() * ch,
    vx: (Math.random() - 0.5) * 0.3,
    vy: -0.2 - Math.random() * 0.4,
    size: Math.random() * 10 + 8,
    opacity: Math.random() * 0.5 + 0.2,
    opacityDir: Math.random() > 0.5 ? 1 : -1,
  }
}

function initCanvas(): void {
  const canvas = canvasRef.value
  if (!canvas || isReduced.value) return
  cw = canvas.offsetWidth
  ch = canvas.offsetHeight
  canvas.width = cw
  canvas.height = ch
  sceneParticles = Array.from({ length: 25 }, makeParticle)
}

function drawParticles(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, cw, ch)

  const char = config.value.particleChar
  const hue = config.value.particleHue

  for (const p of sceneParticles) {
    // Update
    p.x += p.vx
    p.y += p.vy
    p.opacity += p.opacityDir * 0.003
    if (p.opacity > 0.7) { p.opacity = 0.7; p.opacityDir = -1 }
    if (p.opacity < 0.1) { p.opacity = 0.1; p.opacityDir = 1 }

    // Wrap edges
    if (p.y < -20) p.y = ch + 10
    if (p.x < -20) p.x = cw + 10
    if (p.x > cw + 20) p.x = -10

    ctx.save()
    ctx.globalAlpha = p.opacity
    ctx.font = `${p.size}px serif`
    ctx.fillStyle = `hsl(${hue}, 65%, 70%)`
    ctx.fillText(char, p.x, p.y)
    ctx.restore()
  }

  rafId = requestAnimationFrame(drawParticles)
}

function onResize(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  cw = canvas.offsetWidth
  ch = canvas.offsetHeight
  canvas.width = cw
  canvas.height = ch
}

onMounted(() => {
  if (isReduced.value) return
  initCanvas()
  rafId = requestAnimationFrame(drawParticles)
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <article
    ref="articleRef"
    class="story-scene"
    :data-index="props.index"
  >
    <!-- Visual panel — replaces image, uses animated gradient + particles -->
    <div
      class="scene-visual"
      :style="{
        '--grad-from': config.gradientFrom,
        '--grad-to': config.gradientTo,
      }"
      aria-hidden="true"
    >
      <img
        v-if="scene.imageSrc"
        :src="scene.imageSrc"
        :alt="scene.imageAlt"
        class="scene-image"
      />
      <!-- Texture overlay -->
      <div class="scene-texture"></div>

      <canvas
        v-if="!isReduced"
        ref="canvasRef"
        class="scene-particle-canvas"
      />
    </div>

    <!-- Copy -->
    <div class="scene-copy">
      <!-- Scene number indicator -->
      <span class="scene-number" aria-hidden="true">
        {{ String(props.index + 1).padStart(2, '0') }}
      </span>
      <p class="scene-text">{{ scene.copy }}</p>
    </div>
  </article>
</template>

<style scoped>
/* ─── Layout ────────────────────────────────────── */
.story-scene {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  height: 100svh;
  height: 100dvh;
  background-color: var(--color-midnight-950);
  overflow: hidden;
}

/* ─── Visual Panel ──────────────────────────────── */
.scene-visual {
  position: relative;
  overflow: hidden;
  /* Animated gradient using CSS custom properties set via :style */
  background: linear-gradient(145deg, var(--grad-from), var(--grad-to));
  background-size: 200% 200%;
  animation: scene-grad-shift 10s ease-in-out infinite alternate;
}

.scene-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.4;
  mix-blend-mode: luminosity;
  transition: opacity 0.5s ease;
}

.scene-texture {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 1;
}

@keyframes scene-grad-shift {
  0%   { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

/* Subtle radial overlay for depth */
.scene-visual::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 70% 70% at 50% 40%,
    hsla(350, 65%, 30%, 0.15) 0%,
    transparent 70%
  );
  pointer-events: none;
  z-index: 2;
}

/* Vignette at bottom to blend into content */
.scene-visual::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40%;
  background: linear-gradient(to bottom, transparent, var(--color-midnight-950));
  pointer-events: none;
  z-index: 2;
}

.scene-particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
}

/* ─── Copy ──────────────────────────────────────── */
.scene-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--section-pad-y) var(--section-pad-x);
  gap: 1.5rem;
  background-color: var(--color-midnight-950);
}

/* Scene number: small dim counter */
.scene-number {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.3em;
  color: var(--color-crimson-light);
  opacity: 0.8;
  text-transform: uppercase;
}

.scene-text {
  font-family: var(--font-display);
  font-size: clamp(1.75rem, 3vw, 2.5rem);
  font-weight: 300;
  font-style: italic;
  line-height: 1.3;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  padding-bottom: 0.25rem;
}

/* ─── Tablet ────────────────────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .scene-copy {
    padding: var(--section-pad-y) clamp(2rem, 6vw, var(--section-pad-x));
  }
  .scene-text {
    font-size: clamp(1.5rem, 4vw, 2.2rem);
  }
}

/* ─── Mobile ────────────────────────────────────── */
@media (max-width: 767px) {
  .story-scene {
    grid-template-columns: 1fr;
    grid-template-rows: 60vw 1fr;
    height: auto;
    min-height: 100svh;
    min-height: 100dvh;
  }

  .scene-visual {
    height: 60vw;
    min-height: 280px;
  }

  .scene-copy {
    padding: 3rem var(--section-pad-x-mobile);
    justify-content: flex-start;
    min-height: 40vh;
  }

  .scene-text {
    font-size: 1.5rem;
  }
}

/* ─── Reduced Motion ────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .scene-visual {
    animation: none;
  }
  .scene-text {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
