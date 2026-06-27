<script setup lang="ts">
import { ref, computed } from 'vue'
import { useReducedMotion } from './composables/useReducedMotion'
import NavBar from './components/NavBar.vue'
import HeroSection from './components/HeroSection.vue'
import ParticleField from './components/ParticleField.vue'
import BloomEffect from './components/BloomEffect.vue'
import StorySection from './components/StorySection.vue'
import GallerySection from './components/GallerySection.vue'
import MessageSection from './components/MessageSection.vue'
import ClosingSection from './components/ClosingSection.vue'

// Reduced motion preference — passed down to all animated sections
const { isReduced } = useReducedMotion()

// bloomPlaying ref: set to true by HeroSection's scroll engine callback
// passed to BloomEffect as :play="bloomPlaying"
const bloomPlaying = ref(false)

function onBloomTrigger() {
  bloomPlaying.value = true
}

// heroRef: component instance reference for HeroSection
// heroSectionEl: computed DOM element exposed via defineExpose, passed to NavBar
const heroRef = ref<InstanceType<typeof HeroSection>>()
const heroSectionEl = computed(() => heroRef.value?.sectionRef ?? null)
</script>

<template>
  <div
    id="app-root"
    :data-reduced="isReduced"
  >
    <!-- 1. NavBar: position fixed, z-index: var(--z-nav) -->
    <!-- heroSectionEl is the raw HTMLElement for IntersectionObserver -->
    <NavBar :heroRef="heroSectionEl" />

    <!-- 2. HeroSection: layout: pinned-scroll-hero -->
    <!-- ParticleField injected via named slot "particles" -->
    <HeroSection
      ref="heroRef"
      :isReduced="isReduced"
      :onBloomTrigger="onBloomTrigger"
    >
      <template #particles>
        <ParticleField :reduced="isReduced" />
      </template>
    </HeroSection>

    <!-- 3. BloomEffect: triggered by hero scroll progress >= 80% -->
    <!-- Layout: stands alone between hero and story (different from both) -->
    <BloomEffect :play="bloomPlaying" :reduced="isReduced" />

    <!-- 4. StorySection: layout: sticky-stack -->
    <StorySection :isReduced="isReduced" />

    <!-- 5. GallerySection: layout: horizontal-scroll-hijack -->
    <GallerySection :reduced="isReduced" />

    <!-- 6. MessageSection: layout: editorial-manifesto -->
    <MessageSection :isReduced="isReduced" />

    <!-- 7. ClosingSection: layout: minimal-cta (includes FooterBar) -->
    <ClosingSection />
  </div>
</template>

<style scoped>
#app-root {
  min-height: 100dvh;
}
</style>
