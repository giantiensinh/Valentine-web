<script setup lang="ts">
import { ref } from 'vue'
import StoryScene from './StoryScene.vue'
import { storyScenes } from '../data/content'
import { useStoryScrollEngine } from '../composables/useScrollEngine'
import { useIntersectionObserver } from '@vueuse/core'

const sectionRef = ref<HTMLElement>()
const sceneRefs = ref<HTMLElement[]>([])
const activeScene = ref(0)
const isSectionVisible = ref(false)

function setSceneRef(el: unknown, index: number) {
  // el có thể là Vue component instance hoặc raw HTMLElement
  // unwrap $el nếu là component
  const domEl = el && typeof (el as any).$el !== 'undefined'
    ? (el as any).$el as HTMLElement
    : el as HTMLElement | null
  if (domEl) sceneRefs.value[index] = domEl
}

// Track section visibility — dots only show while story is in viewport
useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    isSectionVisible.value = entry.isIntersecting
  },
  { threshold: 0.1 }
)

// Scene observers set up in onMounted (after sceneRefs are populated)
// NOTE: useIntersectionObserver must be called at setup() time, so we
// pre-register all observers up front using a getter that resolves lazily.
storyScenes.forEach((_, i) => {
  useIntersectionObserver(
    () => sceneRefs.value[i] ?? null,
    ([entry]) => {
      if (entry?.isIntersecting) activeScene.value = i
    },
    { threshold: 0.5 }
  )
})

useStoryScrollEngine(sectionRef, sceneRefs)
</script>

<template>
  <section
    ref="sectionRef"
    class="story-section"
    aria-label="Our story"
  >
    <StoryScene
      v-for="(scene, i) in storyScenes"
      :key="scene.id"
      :ref="(el) => setSceneRef(el, i)"
      :scene="scene"
      :index="i"
    />

    <!-- Progress dots: only visible while story section is on screen -->
    <Transition name="dots-fade">
      <nav
        v-if="isSectionVisible"
        class="story-progress"
        aria-label="Story progress"
      >
        <button
          v-for="(scene, i) in storyScenes"
          :key="scene.id"
          class="story-dot"
          :class="{ 'story-dot--active': activeScene === i }"
          :aria-label="`Cảnh ${i + 1} / ${storyScenes.length}`"
          :aria-current="activeScene === i ? 'true' : undefined"
          @click="sceneRefs[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })"
        />
      </nav>
    </Transition>
  </section>
</template>

<style scoped>
.story-section {
  position: relative;
  background-color: var(--color-midnight-900);
}

.story-progress {
  position: fixed;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
  z-index: var(--z-nav);
}

.story-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-ivory);
  opacity: 0.3;
  border: 1px solid transparent;
  padding: 0;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.story-dot--active {
  opacity: 1;
  transform: scale(1.8);
  background-color: var(--color-crimson-light);
  box-shadow: 0 0 10px var(--color-glow-crimson);
}

.story-dot:hover:not(.story-dot--active) {
  opacity: 0.7;
  transform: scale(1.2);
}

/* Dots fade in/out transition */
.dots-fade-enter-active,
.dots-fade-leave-active {
  transition: opacity 0.4s ease;
}
.dots-fade-enter-from,
.dots-fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .story-section :deep(.story-scene) {
    position: static !important;
  }
  .story-dot {
    transition: none;
  }
  .dots-fade-enter-active,
  .dots-fade-leave-active {
    transition: none;
  }
}

@media (max-width: 767px) {
  .story-progress {
    right: unset;
    left: 50%;
    top: unset;
    bottom: 1.25rem;
    transform: translateX(-50%);
    flex-direction: row;
  }
}
</style>
