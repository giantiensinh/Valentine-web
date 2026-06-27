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
    <!-- Visual asset -->
    <div class="scene-asset">
      <img
        :src="scene.imageSrc"
        :alt="scene.imageAlt"
        width="900"
        height="1200"
        loading="lazy"
        class="scene-image"
      />
    </div>

    <!-- Copy: ≤ 25 words -->
    <div class="scene-copy">
      <p class="scene-text">{{ scene.copy }}</p>
    </div>
  </article>
</template>

<style scoped>
.story-scene {
  position: sticky;
  top: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100dvh;
  background-color: var(--color-midnight-900);
  overflow: hidden;
}

.scene-asset {
  position: relative;
  overflow: hidden;
}

.scene-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  aspect-ratio: 3 / 4;
}

.scene-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--section-pad-y) var(--section-pad-x);
}

.scene-text {
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2.5vw, var(--text-4xl));
  font-weight: 300;
  font-style: italic;
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  padding-bottom: 0.25rem; /* reserve for italic descenders (Req 3.4) */
}

/* Mobile: single column */
@media (max-width: 767px) {
  .story-scene {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto;
  }

  .scene-asset {
    height: 60vw;
  }

  .scene-image {
    height: 100%;
    aspect-ratio: unset;
  }

  .scene-copy {
    padding: 2rem var(--section-pad-x-narrow);
  }

  .scene-text {
    font-size: var(--text-xl);
  }
}
</style>
