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

// Entrance animation on mount — elements start visible, GSAP adds polish
onMounted(() => {
  if (isReduced.value) return

  const tl = gsap.timeline({ defaults: { ease: 'cubic-bezier(0.16, 1, 0.3, 1)' } })

  if (eyebrowRef.value) {
    gsap.set(eyebrowRef.value, { y: 20, opacity: 0 })
    tl.to(eyebrowRef.value, { y: 0, opacity: 1, duration: 0.8 }, 0.1)
  }

  if (headlineRef.value) {
    const wordSpans = Array.from(headlineRef.value.querySelectorAll<HTMLElement>('.word-token'))
    if (wordSpans.length) {
      gsap.set(wordSpans, { y: 40, opacity: 0 })
      tl.to(wordSpans, { y: 0, opacity: 1, duration: 1.2, stagger: 0.08 }, 0.3)
    }
  }

  if (subtextRef.value) {
    gsap.set(subtextRef.value, { y: 20, opacity: 0 })
    tl.to(subtextRef.value, { y: 0, opacity: 1, duration: 0.8 }, 0.7)
  }

  if (ctaRef.value) {
    gsap.set(ctaRef.value, { y: 20, opacity: 0 })
    tl.to(ctaRef.value, { y: 0, opacity: 1, duration: 0.8 }, 0.9)
  }

  if (scrollIndicatorRef.value) {
    gsap.set(scrollIndicatorRef.value, { opacity: 0 })
    tl.to(scrollIndicatorRef.value, { opacity: 0.5, duration: 0.6 }, 1.2)
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
      <span class="scroll-text">Khám phá</span>
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
/* ─── Hero Layout — full width, heart as background ── */
.hero-section {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100svh;
  height: 100dvh;
  padding-top: clamp(4rem, 8vw, 6rem);
  padding-bottom: var(--section-pad-y);
  padding-left: var(--section-pad-x);
  padding-right: var(--section-pad-x);
  background-color: var(--color-midnight-950);
  overflow: hidden;
}

/* ─── Heart canvas: absolute background layer ─────── */
.hero-heart-panel {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  /* fade right side so text is readable */
  mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.8) 100%);
  -webkit-mask-image: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 20%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.8) 100%);
}

.heart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* ─── Text column: full width, z above heart ─────── */
.hero-text {
  position: relative;
  z-index: var(--z-content);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
}

.hero-eyebrow {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wider);
  text-transform: uppercase;
  color: var(--color-crimson-light);
  opacity: 1;
}

.hero-headline {
  font-family: var(--font-display);
  /* Now has full viewport width — can be large again */
  font-size: clamp(3.5rem, 8vw, 7.5rem);
  font-weight: 300;
  line-height: 1.0;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
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
  animation: headline-shimmer 4s ease-out forwards;
  animation-delay: 0.8s;
}

@keyframes headline-shimmer {
  0%   { background-position: 200% center; }
  100% { background-position: -200% center; }
}

.word-token { display: inline-block; }
.word-space  { display: inline-block; }

.hero-subtext {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: var(--leading-normal);
  color: var(--color-ivory-dim);
  max-width: 48ch;
  opacity: 1;
}

.hero-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: flex-start;
  padding: 1.25rem 3.5rem;
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
  transition: background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 1;
}

.hero-cta::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-crimson-light);
  transform: translateX(-101%);
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: -1;
}

.hero-cta:hover {
  box-shadow: 0 0 32px var(--color-glow-crimson);
  transform: translateY(-2px);
}

.hero-cta:hover::before {
  transform: translateX(0);
}

.hero-cta:active { transform: scale(0.97); }

/* ─── Scroll Indicator ────────────────────────────── */
.hero-scroll-indicator {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: var(--z-content);
  color: var(--color-ivory);
  opacity: 0.6;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.hero-scroll-indicator:hover {
    opacity: 1;
    transform: translateX(-50%) translateY(4px);
}

.scroll-text {
    font-size: 0.65rem;
    text-transform: uppercase;
    letter-spacing: 0.2em;
    font-weight: 500;
}

.scroll-arrow { animation: arrow-bounce 2s ease-in-out infinite; }

@keyframes arrow-bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(8px); }
}

/* ─── Cursor glow ─────────────────────────────────── */
.hero-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, var(--color-glow-crimson) 0%, transparent 70%);
  pointer-events: none;
  transform: translate(-50%, -50%);
  transition: left 0.15s cubic-bezier(0.16, 1, 0.3, 1), top 0.15s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 2;
  will-change: left, top;
}

/* ─── Tablet ──────────────────────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .hero-section { padding-left: clamp(2rem, 5vw, var(--section-pad-x)); padding-right: clamp(2rem, 5vw, var(--section-pad-x)); }
  .hero-headline { font-size: clamp(3rem, 6vw, 5rem); }
}

/* ─── Mobile ──────────────────────────────────────── */
@media (max-width: 767px) {
  .hero-section {
    padding-left: var(--section-pad-x-mobile);
    padding-right: var(--section-pad-x-mobile);
    padding-top: 6rem;
    padding-bottom: 5rem;
    justify-content: flex-start;
  }
  .hero-text { gap: 1.25rem; max-width: 100%; }
  .hero-eyebrow { font-size: 0.7rem; }
  .hero-headline {
    font-size: clamp(2.5rem, 11vw, 3.5rem);
    line-height: 1.1;
    word-break: normal;
  }
  .hero-subtext { font-size: var(--text-base); max-width: 100%; }
  .hero-cta { padding: 1rem 2.5rem; font-size: 0.75rem; width: 100%; }
  /* On mobile, heart is fully transparent on left side */
  .hero-heart-panel {
    mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
    -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.8) 100%);
  }
  .hero-scroll-indicator { bottom: 1.5rem; }
  .scroll-text { display: none; }
}

/* ─── Reduced Motion ──────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .scroll-arrow { animation: none; }
  .hero-headline { animation: none; }
}
</style>
