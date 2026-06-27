<script setup lang="ts">
import type { StorySceneData } from '../types/index'

const props = defineProps<{
  scene: StorySceneData
  index: number
}>()
</script>

<template>
  <article
    class="story-scene"
    :data-index="props.index"
  >
    <!-- Visual asset: left column on desktop, top on mobile -->
    <div class="scene-asset">
      <div class="scene-image-skeleton" aria-hidden="true"></div>
      <img
        :src="scene.imageSrc"
        :alt="scene.imageAlt"
        width="900"
        height="1200"
        loading="lazy"
        class="scene-image"
      />
    </div>

    <!-- Copy: ≤ 25 words — text animated by useStoryScrollEngine -->
    <div class="scene-copy">
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
  /* Exact height so sticky stack works correctly */
  height: 100svh;
  height: 100dvh;
  background-color: var(--color-midnight-900);
  overflow: hidden;
}

/* ─── Asset ─────────────────────────────────────── */
.scene-asset {
  position: relative;
  overflow: hidden;
}

/* Skeleton loader while lazy image loads */
.scene-image-skeleton {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    110deg,
    hsl(225 38% 11%) 0%,
    hsl(225 38% 14%) 40%,
    hsl(225 38% 11%) 80%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s ease-in-out infinite;
  z-index: 1;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.scene-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  z-index: 2;
}

/* ─── Copy ──────────────────────────────────────── */
.scene-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--section-pad-y) var(--section-pad-x);
}

/*
 * scene-text starts with opacity: 0 — GSAP in useStoryScrollEngine fades it in.
 * Reduced motion: show immediately via @media override below.
 */
.scene-text {
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2.5vw, var(--text-4xl));
  font-weight: 300;
  font-style: italic;
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  /* Reserve space for italic descenders */
  padding-bottom: 0.25rem;
}

/* ─── Tablet (768–1024px) ───────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .scene-copy {
    padding: var(--section-pad-y) clamp(1.5rem, 4vw, var(--section-pad-x));
  }

  .scene-text {
    font-size: clamp(var(--text-xl), 3vw, var(--text-2xl));
  }
}

/* ─── Mobile (< 768px) ──────────────────────────── */
@media (max-width: 767px) {
  .story-scene {
    grid-template-columns: 1fr;
    grid-template-rows: 55vw 1fr;
    height: auto;
    min-height: 100svh;
    min-height: 100dvh;
  }

  .scene-asset {
    height: 55vw;
    min-height: 220px;
    position: relative;
  }

  .scene-image {
    position: absolute;
  }

  .scene-copy {
    padding: 2rem var(--section-pad-x-narrow);
    justify-content: flex-start;
  }

  .scene-text {
    font-size: var(--text-xl);
  }
}

/* ─── Reduced Motion ────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .scene-image-skeleton {
    animation: none;
    display: none;
  }

  .scene-text {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
