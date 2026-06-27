<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useReducedMotion } from '../composables/useReducedMotion'
import { useHeroScrollEngine } from '../composables/useScrollEngine'

const props = defineProps<{
  isReduced?: boolean
  onBloomTrigger: () => void
}>()

// Read reduced motion directly from browser preference
const { isReduced } = useReducedMotion()
const sectionRef = ref<HTMLElement>()
const headlineRef = ref<HTMLElement>()

// Register scroll engine (guards isReduced internally)
useHeroScrollEngine(sectionRef, props.onBloomTrigger)

// Expose sectionRef so App.vue can pass the DOM element to NavBar
defineExpose({ sectionRef })

// Scroll to story section (next section after hero + bloom)
function scrollToStory() {
  const storySection = document.querySelector<HTMLElement>('[aria-label="Our story"]')
  if (!storySection) return
  storySection.scrollIntoView({ behavior: isReduced.value ? 'auto' : 'smooth' })
}

// Entrance animation on mount
onMounted(() => {
  if (isReduced.value || !headlineRef.value) return

  const wordSpans = headlineRef.value.querySelectorAll<HTMLElement>('.word-token')
  if (!wordSpans.length) return

  gsap.from(wordSpans, {
    y: 40,
    opacity: 0,
    ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
    duration: 1.2,
    stagger: 0.08,
  })
})
</script>

<template>
  <section
    ref="sectionRef"
    class="hero-section"
    aria-label="Hero"
  >
    <!-- Particle field slot: ParticleField rendered here via parent -->
    <slot name="particles" />

    <!-- Text Column: ≤ 55vw -->
    <div class="hero-text">
      <!-- 1. Eyebrow: uppercase + wide tracking micro-label -->
      <p class="hero-eyebrow">Một ngày đặc biệt</p>

      <!-- 2. Display headline: split into word tokens for GSAP entrance -->
      <h1
        ref="headlineRef"
        class="hero-headline"
        aria-label="Vì em, mọi ngày đều là Valentine"
      >
        <span
          v-for="(word, i) in 'Vì em, mọi ngày đều là Valentine'.split(' ')"
          :key="i"
          class="word-token inline-block overflow-hidden"
        >{{ word }}<span class="word-space" aria-hidden="true">&nbsp;</span></span>
      </h1>

      <!-- 3. Subtext: ≤ 20 words -->
      <p class="hero-subtext">
        Một website nhỏ gửi đến người mà trái tim tôi luôn hướng về.
      </p>

      <!-- 4. CTA button: scrolls to story section on click -->
      <button class="hero-cta" type="button" @click="scrollToStory">
        Khám phá câu chuyện
      </button>
    </div>

    <!-- Asset Column -->
    <div class="hero-asset" aria-hidden="true">
      <img
        src="https://picsum.photos/seed/valentine-hero/900/1200"
        alt="Khoảnh khắc lãng mạn"
        width="900"
        height="1200"
        fetchpriority="high"
        loading="eager"
        class="hero-image"
      />
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 55%) 1fr;
  grid-template-rows: 1fr;
  min-height: 100dvh;
  height: 100dvh;
  padding-top: clamp(4rem, 8vw, 6rem);
  padding-bottom: var(--section-pad-y);
  padding-left: var(--section-pad-x);
  padding-right: 0;
  background-color: var(--color-midnight-900);
  overflow: hidden;
}

.hero-text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1.5rem;
  z-index: var(--z-content);
  padding-right: 2rem;
  align-self: center;
}

.hero-eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  color: var(--color-crimson-light);
}

.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(var(--text-5xl), 7vw, var(--text-7xl));
  font-weight: 300;
  line-height: var(--leading-tight);
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
}

.word-token {
  display: inline-block;
  overflow: hidden;
}

.word-space {
  display: inline;
}

.hero-subtext {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-ivory-dim);
  max-width: 40ch;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  padding: 0.875rem 2.5rem;
  background-color: var(--color-crimson);
  color: var(--color-ivory);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: background-color 0.2s ease, transform 0.15s ease;
}

.hero-cta:hover {
  background-color: var(--color-crimson-dark);
}

.hero-cta:active {
  transform: scale(0.97);
}

/* Asset column: fills the right grid cell completely */
.hero-asset {
  position: relative;
  overflow: hidden;
  align-self: stretch;
}

.hero-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

@media (max-width: 767px) {
  .hero-section {
    display: flex;
    flex-direction: column;
    height: auto;
    min-height: 100dvh;
    padding-left: var(--section-pad-x-narrow);
    padding-right: var(--section-pad-x-narrow);
    padding-top: 5rem;
    padding-bottom: 2rem;
    gap: 2rem;
    overflow: hidden;
  }

  .hero-text {
    padding-right: 0;
    flex: 0 0 auto;
  }

  .hero-headline {
    font-size: clamp(2.25rem, 10vw, var(--text-5xl));
  }

  .hero-asset {
    position: relative;
    flex: 0 0 auto;
    height: 55vw;
    min-height: 220px;
    width: 100%;
  }

  .hero-image {
    position: absolute;
  }
}
</style>
