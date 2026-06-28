<script setup lang="ts">
/**
 * ConfettiOverlay: Heart explosion + confetti burst.
 * Triggered by parent via expose.burst().
 * Spawns ~80 particles (hearts + squares) using GSAP.
 */
import { ref } from 'vue'
import { gsap } from 'gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const { isReduced } = useReducedMotion()
const containerRef = ref<HTMLElement>()

const CHARS = ['❤', '♥', '♡', '💕', '✨', '🌸']
const COLORS = [
  'hsl(350,70%,60%)', 'hsl(340,65%,65%)', 'hsl(320,60%,70%)',
  'hsl(0,75%,65%)',   'hsl(48,80%,75%)',  'hsl(280,55%,70%)',
]

function burst(originX?: number, originY?: number) {
  if (!containerRef.value || isReduced.value) return

  const cx = originX ?? window.innerWidth / 2
  const cy = originY ?? window.innerHeight / 2
  const count = 80

  for (let i = 0; i < count; i++) {
    const el = document.createElement('span')
    const isHeart = Math.random() > 0.35
    el.textContent = isHeart ? CHARS[Math.floor(Math.random() * CHARS.length)] : '■'
    const size = Math.random() * 1.2 + 0.5
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]

    el.style.cssText = `
      position: fixed;
      left: ${cx}px;
      top: ${cy}px;
      font-size: ${size}rem;
      color: ${color};
      pointer-events: none;
      user-select: none;
      z-index: 9990;
      transform: translate(-50%, -50%);
      will-change: transform, opacity;
    `
    document.body.appendChild(el)

    const angle = Math.random() * Math.PI * 2
    const velocity = Math.random() * 300 + 100
    const tx = Math.cos(angle) * velocity
    const ty = Math.sin(angle) * velocity - Math.random() * 200
    const rotation = Math.random() * 720 - 360
    const duration = Math.random() * 1.2 + 0.8

    gsap.fromTo(el,
      { opacity: 1, scale: 0 },
      {
        x: tx,
        y: ty,
        rotation,
        scale: 1,
        opacity: 0,
        duration,
        ease: 'power2.out',
        onComplete: () => el.remove(),
      }
    )
  }

  // Second wave with slight delay for richness
  setTimeout(() => {
    for (let i = 0; i < 30; i++) {
      const el = document.createElement('span')
      el.textContent = CHARS[Math.floor(Math.random() * 3)]
      const size = Math.random() * 1.8 + 0.8
      el.style.cssText = `
        position: fixed;
        left: ${cx + (Math.random() - 0.5) * 40}px;
        top: ${cy + (Math.random() - 0.5) * 40}px;
        font-size: ${size}rem;
        color: hsl(350, 70%, ${50 + Math.random() * 20}%);
        pointer-events: none;
        user-select: none;
        z-index: 9991;
        transform: translate(-50%, -50%);
        filter: drop-shadow(0 0 6px hsl(350 65% 55% / 0.8));
      `
      document.body.appendChild(el)

      const angle = Math.random() * Math.PI * 2
      const dist = Math.random() * 200 + 80

      gsap.fromTo(el,
        { opacity: 0.9, scale: 1.5 },
        {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 150,
          opacity: 0,
          scale: 0.2,
          duration: Math.random() * 1 + 1,
          ease: 'power3.out',
          onComplete: () => el.remove(),
        }
      )
    }
  }, 150)
}

defineExpose({ burst })
</script>

<template>
  <div ref="containerRef" class="confetti-container" aria-hidden="true" />
</template>

<style scoped>
.confetti-container {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9990;
}
</style>
