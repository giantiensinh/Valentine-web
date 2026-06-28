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
const imageWrapperRef = ref<HTMLElement>()
const imageRef = ref<HTMLImageElement>()
const captionRef = ref<HTMLElement>()
const imageLoaded = ref(false)

// 3D tilt on hover
useTiltEffect(imageWrapperRef)

function onImgLoad() {
  imageLoaded.value = true
}

// Zoom image + slide caption on hover
function onMouseEnter() {
  if (isReduced.value) return
  if (imageRef.value) {
    gsap.to(imageRef.value, { scale: 1.06, duration: 0.5, ease: 'power2.out' })
  }
  if (captionRef.value) {
    gsap.to(captionRef.value, { y: -4, opacity: 1, duration: 0.3, ease: 'power2.out' })
  }
}

function onMouseLeave() {
  if (isReduced.value) return
  if (imageRef.value) {
    gsap.to(imageRef.value, { scale: 1, duration: 0.5, ease: 'power2.out' })
  }
  if (captionRef.value) {
    gsap.to(captionRef.value, { y: 0, opacity: 0.6, duration: 0.3, ease: 'power2.out' })
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
      ref="imageWrapperRef"
      class="gallery-image-wrapper"
      :style="{ aspectRatio: item.aspectRatio }"
    >
      <!-- Skeleton -->
      <div
        class="gallery-skeleton"
        :class="{ 'is-hidden': imageLoaded }"
        aria-hidden="true"
      ></div>

      <img
        ref="imageRef"
        :src="item.src"
        :alt="item.alt"
        loading="lazy"
        class="gallery-image"
        :class="{ 'is-loaded': imageLoaded }"
        :style="{ aspectRatio: item.aspectRatio }"
        @load="onImgLoad"
      />
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

.gallery-image-wrapper {
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
}

/* Skeleton */
.gallery-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    hsl(225 38% 11%) 0%,
    hsl(225 38% 15%) 40%,
    hsl(225 38% 11%) 80%
  );
  background-size: 200% 100%;
  animation: gallery-shimmer 1.5s ease-in-out infinite;
  z-index: 1;
  transition: opacity 0.4s ease;
}

.gallery-skeleton.is-hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes gallery-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.gallery-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* Scale driven by GSAP on hover — start at 1 */
  transform-origin: center center;
  opacity: 0;
  transition: opacity 0.5s ease;
  z-index: 2;
  position: relative;
}

.gallery-image.is-loaded {
  opacity: 1;
}

.gallery-caption {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.6;
  transition: none; /* GSAP handles opacity/transform */
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .gallery-skeleton {
    animation: none;
    opacity: 0;
  }
  .gallery-image {
    opacity: 1;
  }
  .gallery-caption {
    opacity: 0.6 !important;
    transform: none !important;
  }
}
</style>
