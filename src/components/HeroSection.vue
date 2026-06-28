<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useReducedMotion } from '../composables/useReducedMotion'
import { useHeroScrollEngine } from '../composables/useScrollEngine'
import { useHeartParticles } from '../composables/useHeartParticles'
import MeshGradient from './MeshGradient.vue'

const props = defineProps<{
  isReduced?: boolean
  onBloomTrigger: () => void
}>()

// Read reduced motion directly from browser preference
const { isReduced } = useReducedMotion()
const sectionRef = ref<HTMLElement>()
const headlineRef = ref<HTMLElement>()
const eyebrowRef = ref<HTMLElement>()
const subtextRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const scrollIndicatorRef = ref<HTMLElement>()
const heartCanvasRef = ref<HTMLCanvasElement>()

// Register scroll engine (guards isReduced internally)
useHeroScrollEngine(sectionRef, props.onBloomTrigger)

// Heart particle visual on right side
useHeartParticles(heartCanvasRef, isReduced)

// Expose sectionRef so App.vue can pass the DOM element to NavBar
defineExpose({ sectionRef })

// Scroll to story section (next section after hero + bloom)
function scrollToStory() {
  const storySection = document.querySelector<HTMLElement>('[aria-label="Our story"]')
  if (!storySection) return
  storySection.scrollIntoView({ behavior: isReduced.value ? 'auto' : 'smooth' })
}

// Cursor glow position
const glowX = ref(200)
const glowY = ref(300)
function onMouseMove(e: MouseEvent) {
  if (isReduced.value || !sectionRef.value) return
  const rect = sectionRef.value.getBoundingClientRect()
  glowX.value = e.clientX - rect.left
  glowY.value = e.clientY - rect.top
}

// Entrance animation on mount
onMounted(() => {
  if (isReduced.value) return

  const tl = gsap.timeline({ defaults: { ease: 'cubic-bezier(0.16, 1, 0.3, 1)' } })

  // Eyebrow
  if (eyebrowRef.value) {
    tl.from(eyebrowRef.value, { y: 20, opacity: 0, duration: 0.8 }, 0.1)
  }

  // Headline words stagger
  if (headlineRef.value) {
    const wordSpans = headlineRef.value.querySelectorAll<HTMLElement>('.word-token')
    if (wordSpans.length) {
      tl.from(
        wordSpans,
        { y: 40, opacity: 0, duration: 1.2, stagger: 0.08 },
        0.3
      )
    }
  }

  // Subtext
  if (subtextRef.value) {
    tl.from(subtextRef.value, { y: 20, opacity: 0, duration: 0.8 }, 0.7)
  }

  // CTA
  if (ctaRef.value) {
    tl.from(ctaRef.value, { y: 20, opacity: 0, duration: 0.8 }, 0.9)
  }

  // Scroll indicator
  if (scrollIndicatorRef.value) {
    tl.from(scrollIndicatorRef.value, { opacity: 0, duration: 0.6 }, 1.2)
  }
})
</script>

<template>
  <section
    ref="sectionRef"
    class="hero-section"
    aria-label="Hero"
    @mousemove="onMouseMove"
  >
    <!-- Animated mesh gradient background -->
    <MeshGradient />

    <!-- Cursor glow effect -->
    <div
      v-if="!isReduced"
      class="hero-glow"
      :style="{ left: glowX + 'px', top: glowY + 'px' }"
      aria-hidden="true"
    />

    <!-- Particle field slot: ParticleField rendered here via parent -->
    <slot name="particles" />

    <!-- Text Column -->
    <div class="hero-text">
      <!-- 1. Eyebrow: uppercase + wide tracking micro-label -->
      <p ref="eyebrowRef" class="hero-eyebrow">Một ngày đặc biệt</p>

      <!-- 2. Display headline: split into word tokens for GSAP entrance -->
      <h1
        ref="headlineRef"
        class="hero-headline"
        aria-label="Vì em, mọi ngày đều là Valentine"
      >
        <span
          v-for="(word, i) in 'Vì em, mọi ngày đều là Valentine'.split(' ')"
          :key="i"
          class="word-token"
        >{{ word }}<span class="word-space" aria-hidden="true">&nbsp;</span></span>
      </h1>

      <!-- 3. Subtext: ≤ 20 words -->
      <p ref="subtextRef" class="hero-subtext">
        Một website nhỏ gửi đến người mà trái tim tôi luôn hướng về.
      </p>

      <!-- 4. CTA button: scrolls to story section on click -->
      <button ref="ctaRef" class="hero-cta" type="button" @click="scrollToStory">
        Khám phá câu chuyện
      </button>
    </div>

    <!-- Heart Particle Canvas (right side) -->
    <div class="hero-heart-panel" aria-hidden="true">
      <canvas
        ref="heartCanvasRef"
        class="heart-canvas"
      />
    </div>

    <!-- Scroll indicator: bounce arrow at bottom center -->
    <div
      ref="scrollIndicatorRef"
      class="hero-scroll-indicator"
      aria-label="Cuộn xuống để khám phá"
      role="button"
      tabindex="0"
      @click="scrollToStory"
      @keydown.enter="scrollToStory"
    >
      <svg
        class="scroll-arrow"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M12 5v14M5 12l7 7 7-7"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>
  </section>
</template>

<style scoped>
/* ─── Hero Layout ────────────────────────────────── */
.hero-section {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 55%) 1fr;
  grid-template-rows: 1fr;
  height: 100svh;
  height: 100dvh;
  padding-top: clamp(4rem, 8vw, 6rem);
  padding-bottom: var(--section-pad-y);
  padding-left: var(--section-pad-x);
  padding-right: 0;
  background-color: var(--color-midnight-900);
  overflow: hidden;
}

/* ─── Text Column ─────────────────────────────────── */
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
  overflow: visible;
  padding-bottom: 0.25rem;
  background: linear-gradient(
    105deg,
    var(--color-ivory) 0%,
    var(--color-ivory) 40%,
    hsl(48 60% 98%) 50%,
    var(--color-ivory) 60%,
    var(--color-ivory) 100%
  );
  background-size: 200% auto;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: headline-shimmer 3.5s ease-out forwards;
  animation-delay: 0.5s;
}

@keyframes headline-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

.word-token {
  display: inline;
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
  box-shadow: 0 0 20px hsl(350 65% 42% / 0.5), 0 4px 12px hsl(350 65% 30% / 0.3);
  transform: translateY(-1px) scale(1.02);
}

.hero-cta:active {
  transform: scale(0.97);
}

/* ─── Heart Particle Panel ─────────────────────────── */
.hero-heart-panel {
  position: relative;
  overflow: hidden;
  align-self: stretch;
}

.heart-canvas {
  width: 100%;
  height: 100%;
  display: block;
  cursor: crosshair;
}

/* ─── Scroll Indicator ──────────────────────────────── */
.hero-scroll-indicator {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-content);
  color: var(--color-ivory);
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  transition: opacity 0.2s ease;
}

.hero-scroll-indicator:hover {
  opacity: 0.9;
}

.scroll-arrow {
  animation: arrow-bounce 2s ease-in-out infinite;
}

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(6px); }
}

/* ─── Responsive: Tablet (768–1024px) ─────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .hero-section {
    grid-template-columns: 1fr 1fr;
    padding-left: clamp(2rem, 4vw, var(--section-pad-x));
  }

  .hero-headline {
    font-size: clamp(var(--text-4xl), 5.5vw, var(--text-5xl));
  }

  .hero-text {
    padding-right: 1.5rem;
    gap: 1.25rem;
  }
}

/* ─── Responsive: Mobile (< 768px) ─────────────────────── */
@media (max-width: 767px) {
  .hero-section {
    display: flex;
    flex-direction: column;
    height: 100svh;
    height: 100dvh;
    padding-left: var(--section-pad-x-narrow) !important;
    padding-right: var(--section-pad-x-narrow) !important;
    padding-top: 5rem;
    padding-bottom: 4rem;
    gap: 1.5rem;
    overflow: hidden;
  }

  .hero-text {
    padding-right: 0;
    flex: 0 0 auto;
    gap: 1rem;
  }

  .hero-eyebrow {
    font-size: 0.65rem;
    letter-spacing: 0.1em;
  }

  .hero-headline {
    font-size: clamp(1.75rem, 8vw, 2.5rem);
    line-height: 1.05;
    word-break: keep-all;
    overflow-wrap: normal;
    white-space: normal;
  }

  .hero-subtext {
    font-size: 0.875rem;
    max-width: 100%;
  }

  .hero-cta {
    padding: 0.75rem 1.75rem;
    font-size: 0.7rem;
  }

  .hero-heart-panel {
    flex: 1 1 auto;
    min-height: 0;
    margin-left: calc(-1 * var(--section-pad-x-narrow));
    width: calc(100% + 2 * var(--section-pad-x-narrow));
  }

  .hero-scroll-indicator {
    bottom: 1rem;
  }
}

/* ─── Reduced Motion ────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .scroll-arrow {
    animation: none;
  }
  .hero-headline {
    animation: none;
  }
}

/* ─── Cursor glow ────────────────────────────────────── */
.hero-glow {
  position: absolute;
  width: 320px;
  height: 320px;
  border-radius: 50%;
  background: radial-gradient(
    circle,
    hsl(350 65% 42% / 0.18) 0%,
    transparent 70%
  );
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.12s ease, top 0.12s ease;
  z-index: 0;
  will-change: left, top;
}
</style>
