<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './composables/useReducedMotion'
import LoadingScreen from './components/LoadingScreen.vue'
import CursorEffect from './components/CursorEffect.vue'
import ParallaxHearts from './components/ParallaxHearts.vue'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import ParticleField from './components/ParticleField.vue'
import BloomEffect from './components/BloomEffect.vue'
import StorySection from './components/StorySection.vue'
import GallerySection from './components/GallerySection.vue'
import MessageSection from './components/MessageSection.vue'
import ClosingSection from './components/ClosingSection.vue'

gsap.registerPlugin(ScrollTrigger)

const { isReduced } = useReducedMotion()

// Loading screen — hidden after LoadingScreen emits 'done'
const isLoading = ref(true)
function onLoadingDone() {
  isLoading.value = false
}

const bloomPlaying = ref(false)
function onBloomTrigger() {
  bloomPlaying.value = true
}

const heroRef = ref<InstanceType<typeof HeroSection>>()
const heroSectionEl = computed(() => heroRef.value?.sectionRef ?? null)

onMounted(() => {
  if (document.readyState === 'complete') {
    ScrollTrigger.refresh()
  } else {
    window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
  }
  document.fonts.ready.then(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })
})
</script>

<template>
  <!-- Global SVG filter for grain/noise film effect -->
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <filter id="grain">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feBlend in="SourceGraphic" mode="overlay" result="blend" />
        <feComposite in="blend" in2="SourceGraphic" operator="in" />
      </filter>
    </defs>
  </svg>

  <!-- Loading screen — sits on top of everything -->
  <Transition name="loading-out">
    <LoadingScreen v-if="isLoading" @done="onLoadingDone" />
  </Transition>

  <!-- Main app: rendered but invisible until loading done -->
  <div
    id="app-root"
    :data-reduced="isReduced"
    :class="{ 'app--loading': isLoading }"
  >
    <!-- Global cursor effect (desktop only) -->
    <CursorEffect />

    <!-- Parallax floating hearts (global, 3 depth layers) -->
    <ParallaxHearts />

    <NavBar :heroRef="heroSectionEl" />

    <HeroSection
      ref="heroRef"
      :isReduced="isReduced"
      :onBloomTrigger="onBloomTrigger"
    >
      <template #particles>
        <ParticleField :isReduced="isReduced" />
      </template>
    </HeroSection>

    <BloomEffect :play="bloomPlaying" :isReduced="isReduced" />
    <StorySection :isReduced="isReduced" />
    <GallerySection :reduced="isReduced" />
    <MessageSection :isReduced="isReduced" />
    <ClosingSection />
  </div>
</template>

<style scoped>
#app-root {
  min-height: 100dvh;
  transition: opacity 0.3s ease;
}

/* Keep app invisible during loading to prevent flash */
#app-root.app--loading {
  opacity: 0;
  pointer-events: none;
}

.loading-out-leave-active {
  transition: opacity 0.4s ease;
}
.loading-out-leave-to {
  opacity: 0;
}
</style>
