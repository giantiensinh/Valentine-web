<script setup lang="ts">
import { ref } from 'vue'
import { useTiltEffect } from '../composables/useTiltEffect'
import type { GalleryItemData } from '../types/index'

const props = defineProps<{
  item: GalleryItemData
}>()

const imageWrapperRef = ref<HTMLElement>()

// 3D tilt on hover (Req 6.4, 6.5)
useTiltEffect(imageWrapperRef)
</script>

<template>
  <figure class="gallery-item">
    <!-- Image wrapper: tilt target -->
    <div
      ref="imageWrapperRef"
      class="gallery-image-wrapper"
      :style="{ aspectRatio: item.aspectRatio }"
    >
      <img
        :src="item.src"
        :alt="item.alt"
        loading="lazy"
        class="gallery-image"
        :style="{ aspectRatio: item.aspectRatio }"
      />
    </div>

    <!-- Caption: outside img element, Typography_Body, opacity 0.6 (Req 6.6) -->
    <figcaption class="gallery-caption">{{ item.caption }}</figcaption>
  </figure>
</template>

<style scoped>
.gallery-item {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

/*
 * Image wrapper: establishes 3D transform context for tilt effect.
 * Height is set by the parent (.gallery-track :deep(.gallery-item)).
 * Width adapts via aspect-ratio.
 */
.gallery-image-wrapper {
  position: relative;
  overflow: hidden;
  /* border-radius: 0 per Req 2.6 — no border-radius at all */
  transform-style: preserve-3d;
  /* will-change removed — GSAP adds/removes it automatically during animation (Req 10.2) */
}

.gallery-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  /* NO CSS transition on tilt — GSAP only (Req 6.4) */
}

/*
 * Caption: outside img, Typography_Body, font-size ≤ 0.875rem, opacity 0.6 (Req 6.6)
 * No position: absolute / fixed to avoid overlay (Req 6.7)
 */
.gallery-caption {
  font-family: var(--font-body);
  font-size: var(--text-sm); /* 0.875rem ≤ 0.875rem ✓ */
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.6;
  /* Not position: absolute or fixed — no overlay on img (Req 6.6, 6.7) */
}
</style>
