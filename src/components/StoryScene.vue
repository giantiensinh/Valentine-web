<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from '../composables/useReducedMotion'
import type { StorySceneData } from '../types/index'

gsap.registerPlugin(ScrollTrigger)

const props = defineProps<{
  scene: StorySceneData
  index: number
}>()

const { isReduced } = useReducedMotion()
const articleRef = ref<HTMLElement>()
const imgRef = ref<HTMLImageElement>()
const imageLoaded = ref(false)
let ctx: gsap.Context | null = null

function onImgLoad() {
  imageLoaded.value = true
}

onMounted(() => {
  if (isReduced.value || !articleRef.value || !imgRef.value) return

  // Parallax: image scrolls slightly slower than container (depth effect)
  ctx = gsap.context(() => {
    gsap.to(imgRef.value!, {
      yPercent: -12,
      ease: 'none',
      scrollTrigger: {
        trigger: articleRef.value,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    })
  }, articleRef.value)
})

onUnmounted(() => {
  ctx?.revert()
  ctx = null
})
</script>

<template>
  <article
    ref="articleRef"
    class="story-scene"
    :data-index="props.index"
  >
    <!-- Visual asset -->
    <div class="scene-asset">
      <div
        class="scene-image-skeleton"
        :class="{ 'is-hidden': imageLoaded }"
        aria-hidden="true"
      ></div>
      <img
        ref="imgRef"
        :src="scene.imageSrc"
        :alt="scene.imageAlt"
        width="900"
        height="1200"
        loading="lazy"
        class="scene-image"
        :class="{ 'is-loaded': imageLoaded }"
        @load="onImgLoad"
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
  background-color: var(--color-midnight-900);
  overflow: hidden;
}

/* ─── Asset ─────────────────────────────────────── */
.scene-asset {
  position: relative;
  overflow: hidden;
}

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
  transition: opacity 0.5s ease;
}

.scene-image-skeleton.is-hidden {
  opacity: 0;
  pointer-events: none;
}

@keyframes skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Extra scale to give parallax room to move without white edges */
.scene-image {
  position: absolute;
  inset: -8% 0;
  width: 100%;
  height: 116%;
  object-fit: cover;
  display: block;
  z-index: 2;
  opacity: 0;
  transition: opacity 0.6s ease;
}

.scene-image.is-loaded {
  opacity: 1;
}

/* ─── Copy ──────────────────────────────────────── */
.scene-copy {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--section-pad-y) var(--section-pad-x);
  gap: 1.25rem;
}

/* Scene number: small dim counter in corner */
.scene-number {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.2em;
  color: var(--color-crimson-light);
  opacity: 0.7;
}

.scene-text {
  font-family: var(--font-display);
  font-size: clamp(var(--text-xl), 2.5vw, var(--text-4xl));
  font-weight: 300;
  font-style: italic;
  line-height: var(--leading-snug);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  padding-bottom: 0.25rem;
}

/* ─── Tablet ────────────────────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .scene-copy {
    padding: var(--section-pad-y) clamp(1.5rem, 4vw, var(--section-pad-x));
  }
  .scene-text {
    font-size: clamp(var(--text-xl), 3vw, var(--text-2xl));
  }
}

/* ─── Mobile ────────────────────────────────────── */
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
  }

  .scene-image {
    inset: 0;
    height: 100%;
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
    opacity: 0;
  }
  .scene-image {
    opacity: 1;
    inset: 0;
    height: 100%;
  }
  .scene-text {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
