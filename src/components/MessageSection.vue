<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useIntersectionObserver } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'
import { messageSubtext } from '../data/content'

const { isReduced } = useReducedMotion()
const messageSectionRef = ref<HTMLElement>()
const line1Ref = ref<HTMLElement>()
const line2Ref = ref<HTMLElement>()
const subtextRef = ref<HTMLElement>()
const heartsRef = ref<HTMLElement>()
const underline1Ref = ref<HTMLElement>()
const underline2Ref = ref<HTMLElement>()
const hasRevealed = ref(false)

// Tách headline thành 2 dòng cố định
const line1 = 'Có những điều không cần nói thành lời,'
const line2 = 'chỉ cần em luôn ở đây, bên tôi, là đủ rồi.'

// Animate khi section vào viewport
useIntersectionObserver(
  messageSectionRef,
  ([entry]) => {
    if (!entry.isIntersecting || hasRevealed.value) return
    hasRevealed.value = true
    if (isReduced.value) return

    const tl = gsap.timeline({ defaults: { ease: 'power2.out' } })

    if (line1Ref.value) {
      tl.from(line1Ref.value, { opacity: 0, y: 28, duration: 0.8 }, 0)
    }
    if (line2Ref.value) {
      tl.from(line2Ref.value, { opacity: 0, y: 28, duration: 0.8 }, 0.25)
    }
    if (subtextRef.value) {
      tl.from(subtextRef.value, { opacity: 0, y: 16, duration: 0.6 }, 0.6)
    }

    // Animate underlines: width from 0 → 100%
    if (underline1Ref.value) {
      tl.fromTo(underline1Ref.value, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.4)
    }
    if (underline2Ref.value) {
      tl.fromTo(underline2Ref.value, { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.out' }, 0.65)
    }
  },
  { threshold: 0.25 }
)

// Floating hearts
function spawnHeart() {
  if (!heartsRef.value || isReduced.value) return

  const heart = document.createElement('span')
  heart.textContent = Math.random() > 0.5 ? '♥' : '♡'
  heart.className = 'floating-heart'

  const x = Math.random() * 100
  const size = Math.random() * 1.2 + 0.6
  const hue = Math.random() > 0.6 ? 350 : 0
  const lightness = Math.random() * 20 + 45

  heart.style.cssText = `
    left: ${x}%;
    font-size: ${size}rem;
    color: hsl(${hue}, 65%, ${lightness}%);
    position: absolute;
    bottom: 0;
    opacity: 0;
    pointer-events: none;
    user-select: none;
    line-height: 1;
  `

  heartsRef.value.appendChild(heart)

  gsap.fromTo(heart,
    { opacity: 0, y: 0, scale: 0.5 },
    {
      opacity: 0.7,
      y: -(Math.random() * 220 + 120),
      scale: 1,
      duration: Math.random() * 2.5 + 2.5,
      ease: 'power1.out',
      onComplete: () => { heart.remove() },
    }
  )

  gsap.to(heart, {
    opacity: 0,
    duration: 1.2,
    delay: Math.random() * 1 + 1.5,
    ease: 'power2.in',
  })
}

let spawnInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  if (isReduced.value) return
  spawnInterval = setInterval(spawnHeart, 600)
  setTimeout(spawnHeart, 200)
  setTimeout(spawnHeart, 500)
  setTimeout(spawnHeart, 900)
})

onUnmounted(() => {
  if (spawnInterval) clearInterval(spawnInterval)
})
</script>

<template>
  <section
    ref="messageSectionRef"
    class="message-section"
    :class="{ 'message-section--reduced': isReduced }"
    aria-label="Message"
  >
    <!-- Paper texture overlay -->
    <div class="paper-texture" aria-hidden="true"></div>

    <!-- Floating hearts -->
    <div ref="heartsRef" class="hearts-field" aria-hidden="true"></div>

    <div class="message-content">
      <!-- Headline with animated underlines -->
      <h2 class="message-headline">
        <span class="headline-wrap">
          <span ref="line1Ref" class="headline-line">{{ line1 }}</span>
          <span ref="underline1Ref" class="headline-underline" aria-hidden="true"></span>
        </span>
        <span class="headline-wrap">
          <span ref="line2Ref" class="headline-line headline-line--indent">{{ line2 }}</span>
          <span ref="underline2Ref" class="headline-underline" aria-hidden="true"></span>
        </span>
      </h2>

      <!-- Subtext -->
      <p ref="subtextRef" class="message-subtext">{{ messageSubtext }}</p>

      <!-- Heart pulse at bottom -->
      <div ref="heartPulseRef" class="heart-pulse" aria-hidden="true">♥</div>
    </div>
  </section>
</template>

<style scoped>
.message-section {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--color-midnight-950);
  background-image: radial-gradient(
    ellipse 60vw 60vw at 50% 60%,
    hsla(350, 65%, 35%, 0.15) 0%,
    transparent 70%
  );
  overflow: hidden;
  padding-inline: var(--section-pad-x);
  padding-block: var(--section-pad-y);
}

/* ─── Paper texture ────────────────────────────────── */
.paper-texture {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
}

/* ─── Hearts field ─────────────────────────────── */
.hearts-field {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

/* ─── Content ──────────────────────────────────── */
.message-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

/* ─── Headline ─────────────────────────────────── */
.message-headline {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  line-height: 1.2;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  display: flex;
  flex-direction: column;
  gap: 0.75em;
}

/* Each line wrapped with its underline */
.headline-wrap {
  display: flex;
  flex-direction: column;
  gap: 0.3em;
}

.headline-line {
  display: block;
  font-size: clamp(2.2rem, 4.5vw, 4.5rem);
}

.headline-line--indent {
  padding-left: clamp(1.5rem, 5vw, 4rem);
  opacity: 0.95;
}

/* Animated underline */
.headline-underline {
  display: block;
  height: 1px;
  background: linear-gradient(
    to right,
    var(--color-crimson-light),
    transparent
  );
  transform-origin: left center;
  transform: scaleX(0);
}

/* ─── Subtext ──────────────────────────────────── */
.message-subtext {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.75;
  max-width: 42ch;
}

/* ─── Heart pulse ──────────────────────────────── */
.heart-pulse {
  font-size: clamp(3rem, 6vw, 5rem);
  color: var(--color-crimson-light);
  line-height: 1;
  display: inline-block;
  animation: heart-beat 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
  filter: drop-shadow(0 0 15px var(--color-glow-crimson));
  align-self: flex-start;
  margin-top: 1rem;
}

@keyframes heart-beat {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  14%       { transform: scale(1.3); opacity: 1; }
  28%       { transform: scale(1); opacity: 0.8; }
  42%       { transform: scale(1.15); opacity: 0.9; }
  70%       { transform: scale(1); opacity: 0.8; }
}

/* ─── Reduced motion ───────────────────────────── */
.message-section--reduced .headline-line,
.message-section--reduced .message-subtext {
  opacity: 1 !important;
  transform: none !important;
}

.message-section--reduced .headline-underline {
  transform: scaleX(1) !important;
}

.message-section--reduced .heart-pulse {
  animation: none;
}

/* ─── Tablet ───────────────────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .message-section {
    padding-inline: clamp(2rem, 5vw, var(--section-pad-x));
  }
  .headline-line {
    font-size: clamp(1.75rem, 3.5vw, 3rem);
  }
}

/* ─── Mobile ───────────────────────────────────── */
@media (max-width: 767px) {
  .message-section {
    padding-inline: var(--section-pad-x-narrow);
    padding-block: 4rem;
    align-items: flex-start;
  }

  .message-content {
    gap: 1.5rem;
  }

  .headline-line {
    font-size: clamp(1.2rem, 5.5vw, 1.6rem);
    line-height: 1.4;
  }

  .headline-line--indent {
    padding-left: 0.75rem;
  }

  .message-subtext {
    font-size: var(--text-sm);
    max-width: 100%;
  }

  .heart-pulse {
    font-size: 2.5rem;
  }
}

/* ─── prefers-reduced-motion ───────────────────── */
@media (prefers-reduced-motion: reduce) {
  .heart-pulse {
    animation: none;
  }
  .headline-underline {
    transform: scaleX(1);
    transition: none;
  }
}
</style>
