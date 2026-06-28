<script setup lang="ts">
import { ref } from 'vue'
import GalleryItem from './GalleryItem.vue'
import { galleryItems } from '../data/content'
import { useGalleryScrollEngine } from '../composables/useScrollEngine'
import { useReducedMotion } from '../composables/useReducedMotion'

// Prop mirrors the pattern used by HeroSection / BloomEffect / ParticleField:
// App.vue passes :reduced="isReduced" (boolean) down to animated sections.
const props = defineProps<{
  reduced: boolean
}>()

// Also read directly from composable so CSS class can react to media query changes
// even in contexts where the prop is not forwarded.
const { isReduced } = useReducedMotion()

const sectionRef = ref<HTMLElement>()
const trackRef = ref<HTMLElement>()

// Register horizontal scroll engine.
// useGalleryScrollEngine internally checks isReduced via useReducedMotion()
// and no-ops when reduce is preferred (Req 5.8, 6.8).
useGalleryScrollEngine(sectionRef, trackRef)
</script>

<template>
  <section
    ref="sectionRef"
    class="gallery-section"
    :class="{ 'gallery-section--reduced': isReduced }"
    aria-label="Memories"
  >
    <!-- Scroll hint: only shown when horizontal scroll is active -->
    <div
      v-if="!isReduced"
      class="gallery-hint"
      aria-hidden="true"
    >
      <span class="gallery-hint-text">Cuộn để khám phá</span>
      <span class="gallery-hint-arrow">→</span>
    </div>

    <div
      ref="trackRef"
      class="gallery-track"
    >
      <GalleryItem
        v-for="(item, idx) in galleryItems"
        :key="item.caption + idx"
        :item="item"
      />
    </div>
  </section>
</template>

<style scoped>
/*
 * Wrapper: overflow hidden per Req 6.1.
 * The inner track is wider than the viewport; GSAP translates it horizontally.
 * height: 100dvh gives GSAP ScrollTrigger a known height for the pin.
 */
.gallery-section {
  position: relative;
  overflow: hidden;
  background-color: var(--color-midnight-900);
  height: 100dvh;
}

/*
 * Inner track: horizontal flex row, width = sum of children (max-content).
 * GSAP ScrollTrigger translates this element on the x axis (Req 5.6, 6.1).
 */
.gallery-track {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 2rem;
  padding: var(--section-pad-y) var(--section-pad-x);
  /* Expand to fit all items side-by-side */
  width: max-content;
}

/*
 * Each gallery item: fixed height creates a consistent cinematic band.
 * Width is driven by the aspect-ratio of the image wrapper inside GalleryItem.
 */
.gallery-track :deep(.gallery-item) {
  height: 70vh;
  min-height: 400px;
  flex-shrink: 0;
}

.gallery-track :deep(.gallery-image-wrapper) {
  height: 100%;
  width: auto;
}

/*
 * Reduced motion: disable horizontal layout + hijack (Req 5.8, 6.8).
 * Items fall into a single-column vertical layout.
 */
.gallery-section--reduced .gallery-track {
  flex-direction: column;
  width: 100%;
  padding: var(--section-pad-y) var(--section-pad-x-narrow);
}

.gallery-section--reduced :deep(.gallery-item) {
  height: auto;
  width: 100%;
  max-width: 600px;
}

.gallery-section--reduced :deep(.gallery-image-wrapper) {
  width: 100%;
  height: auto;
}

/*
 * Scroll hint: fixed bottom-right while section is pinned.
 * GSAP fades it out as the user starts scrolling.
 * Uses position: absolute relative to .gallery-section (which is pinned/position:relative).
 */
.gallery-hint {
  position: absolute;
  bottom: 2rem;
  right: var(--section-pad-x);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  z-index: var(--z-content);
  pointer-events: none;
  /* Ensure it sits above the track */
  top: auto;
}

.gallery-hint-text {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-ivory);
  opacity: 0.5;
}

.gallery-hint-arrow {
  font-size: var(--text-base);
  color: var(--color-crimson-light);
  opacity: 0.7;
  animation: hint-nudge 1.8s ease-in-out infinite;
}

@keyframes hint-nudge {
  0%, 100% { transform: translateX(0); }
  50%       { transform: translateX(6px); }
}

/*
 * Mobile (Req 9.7): collapse to vertical scroll layout with 1rem inline padding.
 * Also disables horizontal scroll when reduced-motion is set (Req 6.8).
 */
@media (max-width: 767px) {
  .gallery-section {
    overflow-x: hidden;
  }

  .gallery-track {
    flex-direction: column;
    width: 100%;
    padding: 2rem var(--section-pad-x-narrow);
    gap: 1.5rem;
  }

  .gallery-track :deep(.gallery-item) {
    height: auto;
    width: 100%;
    min-height: unset;
    flex-shrink: unset;
  }

  .gallery-track :deep(.gallery-image-wrapper) {
    width: 100%;
    height: auto;
  }

  /* Hide scroll hint on mobile — not needed in vertical layout */
  .gallery-hint {
    display: none;
  }
}
</style>
