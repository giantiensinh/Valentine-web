<script setup lang="ts">
/**
 * CursorEffect: Custom cursor with glow ring + heart burst on click.
 * - Hides native cursor globally while active
 * - Smooth glow ring follows mouse with GSAP lerp
 * - Click spawns 6 tiny hearts that fly outward
 * - Disabled entirely on touch devices and prefers-reduced-motion
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const { isReduced } = useReducedMotion()

const ringRef = ref<HTMLElement>()
const dotRef = ref<HTMLElement>()
const burstRef = ref<HTMLElement>()

// Detect touch device — skip cursor on touch
const isTouch = ref(false)

let mx = 0, my = 0
let cx = 0, cy = 0
let rafId: number | null = null

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function loop() {
  cx = lerp(cx, mx, 0.12)
  cy = lerp(cy, my, 0.12)

  if (ringRef.value) {
    ringRef.value.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`
  }
  if (dotRef.value) {
    dotRef.value.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`
  }

  rafId = requestAnimationFrame(loop)
}

function onMouseMove(e: MouseEvent) {
  mx = e.clientX
  my = e.clientY
}

function onMouseOver(e: MouseEvent) {
  if (!ringRef.value) return
  const target = e.target as HTMLElement
  if (target.closest('button, a, [role="button"], input, textarea')) {
    gsap.to(ringRef.value, { scale: 1.8, opacity: 0.6, duration: 0.25, ease: 'power2.out' })
  }
}

function onMouseOut(e: MouseEvent) {
  if (!ringRef.value) return
  const target = e.target as HTMLElement
  if (target.closest('button, a, [role="button"], input, textarea')) {
    gsap.to(ringRef.value, { scale: 1, opacity: 1, duration: 0.25, ease: 'power2.out' })
  }
}

// Heart burst on click
function onClick(e: MouseEvent) {
  if (!burstRef.value || isReduced.value) return

  const COUNT = 7
  for (let i = 0; i < COUNT; i++) {
    const heart = document.createElement('span')
    heart.textContent = '❤'
    const angle = (i / COUNT) * Math.PI * 2
    const dist = Math.random() * 60 + 40
    const size = Math.random() * 0.6 + 0.5

    heart.style.cssText = `
      position: fixed;
      left: ${e.clientX}px;
      top: ${e.clientY}px;
      font-size: ${size}rem;
      color: hsl(${Math.random() * 30 + 335}, 70%, 60%);
      pointer-events: none;
      user-select: none;
      z-index: 10000;
      transform: translate(-50%, -50%);
    `
    document.body.appendChild(heart)

    gsap.to(heart, {
      x: Math.cos(angle) * dist,
      y: Math.sin(angle) * dist - 20,
      opacity: 0,
      scale: 0.3,
      duration: 0.7 + Math.random() * 0.3,
      ease: 'power2.out',
      onComplete: () => heart.remove(),
    })
  }
}

onMounted(() => {
  // Detect touch
  isTouch.value = window.matchMedia('(pointer: coarse)').matches
  if (isTouch.value || isReduced.value) return

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseover', onMouseOver)
  document.addEventListener('mouseout', onMouseOut)
  document.addEventListener('click', onClick)
  document.body.style.cursor = 'none'
  rafId = requestAnimationFrame(loop)
})

onUnmounted(() => {
  if (isTouch.value || isReduced.value) return
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseover', onMouseOver)
  document.removeEventListener('mouseout', onMouseOut)
  document.removeEventListener('click', onClick)
  document.body.style.cursor = ''
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<template>
  <!-- Only render on non-touch, non-reduced-motion -->
  <template v-if="!isTouch && !isReduced">
    <!-- Outer glow ring: lags behind slightly -->
    <div ref="ringRef" class="cursor-ring" aria-hidden="true" />
    <!-- Inner dot: snaps immediately to cursor -->
    <div ref="dotRef" class="cursor-dot" aria-hidden="true" />
  </template>
</template>

<style scoped>
.cursor-ring {
  position: fixed;
  top: 0;
  left: 0;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1.5px solid hsl(350 65% 55% / 0.7);
  background: hsl(350 65% 42% / 0.05);
  pointer-events: none;
  z-index: 9998;
  will-change: transform;
  box-shadow: 0 0 12px hsl(350 65% 55% / 0.3);
}

.cursor-dot {
  position: fixed;
  top: 0;
  left: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-crimson-light);
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
  box-shadow: 0 0 6px var(--color-crimson-light);
}
</style>
