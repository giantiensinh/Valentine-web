<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { useTiltEffect } from '../composables/useTiltEffect'
import { useReducedMotion } from '../composables/useReducedMotion'
import type { GalleryItemData } from '../types/index'

const props = defineProps<{
  item: GalleryItemData
}>()

const { isReduced } = useReducedMotion()
const cardWrapperRef = ref<HTMLElement>()
const captionRef = ref<HTMLElement>()
const iconRef = ref<HTMLElement>()

// 3D tilt on hover
useTiltEffect(cardWrapperRef)

// Spawn micro-particles on hover
function spawnParticles(originEl: HTMLElement): void {
  if (isReduced.value) return
  const rect = originEl.getBoundingClientRect()
  for (let i = 0; i < 8; i++) {
    const dot = document.createElement('span')
    dot.style.cssText = `
      position: fixed;
      width: 6px; height: 6px;
      border-radius: 50%;
      background: ${props.item.color ?? 'hsl(350,65%,55%)'};
      left: ${rect.left + rect.width / 2}px;
      top: ${rect.top + rect.height / 2}px;
      pointer-events: none;
      z-index: 9999;
    `
    document.body.appendChild(dot)
    const angle = (i / 8) * Math.PI * 2
    const dist = 40 + Math.random() * 60
    gsap.fromTo(
      dot,
      { opacity: 1, scale: 1 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0,
        scale: 0.3,
        duration: 0.7 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => dot.remove(),
      }
    )
  }
}

// Hover: glow increase + icon scale + caption slide
function onMouseEnter(_e: MouseEvent) {
  if (isReduced.value) return
  if (cardWrapperRef.value) {
    gsap.to(cardWrapperRef.value, {
      boxShadow: `0 0 60px ${props.item.color ?? 'hsl(350,65%,42%)'} / 0.35), 0 0 100px hsl(350 65% 42% / 0.1)`,
      duration: 0.4,
      ease: 'power2.out',
    })
    spawnParticles(cardWrapperRef.value)
  }
  if (iconRef.value) {
    gsap.to(iconRef.value, { scale: 1.2, duration: 0.35, ease: 'back.out(2)' })
  }
  if (captionRef.value) {
    gsap.to(captionRef.value, { y: -4, opacity: 1, duration: 0.3, ease: 'power2.out' })
  }
}

function onMouseLeave() {
  if (isReduced.value) return
  if (iconRef.value) {
    gsap.to(iconRef.value, { scale: 1, duration: 0.35, ease: 'power2.out' })
  }
  if (captionRef.value) {
    gsap.to(captionRef.value, { y: 0, opacity: 0.65, duration: 0.3, ease: 'power2.out' })
  }
}
</script>

<template>
  <figure
    class="gallery-item"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      ref="cardWrapperRef"
      class="gallery-card"
      :style="{ aspectRatio: item.aspectRatio }"
    >
      <!-- Glass card inner -->
      <div class="glass-inner">
        <!-- Large icon at center -->
        <span
          ref="iconRef"
          class="card-icon"
          :style="{ color: item.color ?? 'var(--color-crimson-light)' }"
          aria-hidden="true"
        >
          {{ item.icon ?? '♥' }}
        </span>
      </div>
    </div>

    <figcaption ref="captionRef" class="gallery-caption">
      {{ item.caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.gallery-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* Glass card wrapper — handles tilt + aspect ratio */
.gallery-card {
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  /* Glassmorphism */
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 0 40px hsl(350 65% 42% / 0.15);
  transition: box-shadow 0.4s ease;
}

.glass-inner {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 1.5rem;
}

/* Large icon */
.card-icon {
  font-size: clamp(3rem, 6vw, 5rem);
  line-height: 1;
  display: block;
  filter: drop-shadow(0 0 16px currentColor);
  transition: filter 0.3s ease;
}

.gallery-card:hover .card-icon {
  filter: drop-shadow(0 0 30px currentColor);
}

/* Caption below card */
.gallery-caption {
  font-family: var(--font-display);
  font-size: var(--text-sm);
  font-style: italic;
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.65;
  text-align: center;
  /* GSAP handles opacity/transform transitions */
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .gallery-caption {
    opacity: 0.65 !important;
    transform: none !important;
  }
  .card-icon {
    transform: none !important;
  }
}
</style>
