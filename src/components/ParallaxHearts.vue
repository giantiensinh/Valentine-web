<script setup lang="ts">
/**
 * ParallaxHearts: 3 layers of floating hearts with depth simulation.
 * - Layer 1 (far): small, dim, slow  — speed 0.15x
 * - Layer 2 (mid): medium, semi-opaque — speed 0.4x
 * - Layer 3 (near): large, bright, fast — speed 0.75x
 *
 * Each heart drifts upward continuously in its own loop.
 * Scroll parallax: layers respond to window.scrollY at different rates.
 */
import { onMounted, onUnmounted } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'

const { isReduced } = useReducedMotion()

interface HeartConfig {
  layer: 1 | 2 | 3
  x: number        // 0–100 %
  delay: number    // s
  char: string
}

// Pre-generate hearts to avoid SSR randomness issues
const HEARTS: HeartConfig[] = []
const CHARS = ['♥', '♡', '❤', '💕']

// Far layer: 12 small hearts
for (let i = 0; i < 12; i++) {
  HEARTS.push({
    layer: 1,
    x: (i / 12) * 100 + Math.random() * 8,
    delay: i * 0.9,
    char: CHARS[i % CHARS.length],
  })
}
// Mid layer: 8
for (let i = 0; i < 8; i++) {
  HEARTS.push({
    layer: 2,
    x: (i / 8) * 100 + Math.random() * 10,
    delay: i * 1.3 + 0.4,
    char: CHARS[(i + 1) % CHARS.length],
  })
}
// Near layer: 5 big
for (let i = 0; i < 5; i++) {
  HEARTS.push({
    layer: 3,
    x: (i / 5) * 100 + Math.random() * 15,
    delay: i * 1.8 + 0.2,
    char: CHARS[(i + 2) % CHARS.length],
  })
}

// Layer config
const LAYER = {
  1: { size: '0.6rem', opacity: 0.18, duration: 14, parallax: 0.15 },
  2: { size: '1rem',   opacity: 0.35, duration: 9,  parallax: 0.4  },
  3: { size: '1.6rem', opacity: 0.6,  duration: 6,  parallax: 0.75 },
} as const

// Pause RAF on hidden tab
let rafId: number | null = null

function applyParallax() {
  if (typeof window === 'undefined') return
  const scrollY = window.scrollY

  document.querySelectorAll<HTMLElement>('[data-parallax-layer]').forEach((el) => {
    const speed = parseFloat(el.dataset.parallaxLayer ?? '0')
    el.style.transform = `translateY(${-scrollY * speed}px)`
  })

  rafId = requestAnimationFrame(applyParallax)
}

onMounted(() => {
  if (isReduced.value) return
  rafId = requestAnimationFrame(applyParallax)
})

onUnmounted(() => {
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<template>
  <div
    v-if="!isReduced"
    class="parallax-hearts-wrapper"
    aria-hidden="true"
  >
    <!-- Each layer group gets its own translate container -->
    <div
      v-for="layerNum in [1, 2, 3] as const"
      :key="layerNum"
      class="layer-group"
      :data-parallax-layer="LAYER[layerNum].parallax"
    >
      <span
        v-for="(h, idx) in HEARTS.filter(hh => hh.layer === layerNum)"
        :key="idx"
        class="floating-heart"
        :style="{
          left: h.x + '%',
          fontSize: LAYER[h.layer].size,
          opacity: LAYER[h.layer].opacity,
          animationDuration: LAYER[h.layer].duration + 's',
          animationDelay: h.delay + 's',
        }"
      >{{ h.char }}</span>
    </div>
  </div>
</template>

<style scoped>
.parallax-hearts-wrapper {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.layer-group {
  position: absolute;
  inset: 0;
  will-change: transform;
}

.floating-heart {
  position: absolute;
  bottom: -3rem;
  display: inline-block;
  color: var(--color-crimson-light);
  animation: heart-rise linear infinite;
  will-change: transform, opacity;
  filter: blur(0px);
}

/* Layer 1: add blur for depth */
.layer-group[data-parallax-layer="0.15"] .floating-heart {
  filter: blur(1.5px);
  color: hsl(350 50% 45%);
}
/* Layer 2 */
.layer-group[data-parallax-layer="0.4"] .floating-heart {
  filter: blur(0.5px);
  color: hsl(350 60% 52%);
}
/* Layer 3: sharp and bright */
.layer-group[data-parallax-layer="0.75"] .floating-heart {
  filter: none;
  color: hsl(350 70% 62%);
  text-shadow: 0 0 8px hsl(350 65% 55% / 0.5);
}

@keyframes heart-rise {
  0%   { transform: translateY(0)    translateX(0)    rotate(0deg);   opacity: 0; }
  10%  { opacity: 1; }
  85%  { opacity: 1; }
  100% { transform: translateY(-110vh) translateX(20px) rotate(15deg); opacity: 0; }
}
</style>
