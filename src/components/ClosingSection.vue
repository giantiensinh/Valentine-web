<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { useIntersectionObserver } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'

const { isReduced } = useReducedMotion()
const sectionRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const closingTextRef = ref<HTMLElement>()
const hasFadedIn = ref(false)

// Fade in text then button from bottom — fires once
useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (!entry.isIntersecting || isReduced.value || hasFadedIn.value) return
    hasFadedIn.value = true

    const tl = gsap.timeline()

    if (closingTextRef.value) {
      tl.from(closingTextRef.value, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power2.out',
      }, 0)
    }

    if (ctaRef.value) {
      tl.from(ctaRef.value, {
        opacity: 0,
        y: 20,
        duration: 0.7,
        ease: 'power2.out',
      }, 0.25)
    }
  },
  { threshold: 0.3 }
)

// CTA hover fill animation: fill from nearest edge
function onCtaMouseEnter(e: MouseEvent) {
  if (!ctaRef.value) return
  const rect = ctaRef.value.getBoundingClientRect()
  const fromLeft = e.clientX - rect.left < rect.width / 2
  const fillEl = ctaRef.value.querySelector<HTMLElement>('.cta-fill')
  if (!fillEl) return
  gsap.fromTo(
    fillEl,
    { scaleX: 0, transformOrigin: fromLeft ? 'left center' : 'right center' },
    { scaleX: 1, duration: 0.28, ease: 'power2.out' }
  )
}

function onCtaMouseLeave() {
  const fillEl = ctaRef.value?.querySelector<HTMLElement>('.cta-fill')
  if (!fillEl) return
  gsap.to(fillEl, { scaleX: 0, duration: 0.2, ease: 'power2.in' })
}
</script>

<template>
  <section
    ref="sectionRef"
    class="closing-section"
    aria-label="Closing"
  >
    <div class="closing-content">
      <!-- Text node: ≤ 10 words -->
      <p ref="closingTextRef" class="closing-text">Mãi mãi, chỉ là em thôi.</p>

      <!-- CTA: ≤ 3 words label, hover fill from nearest edge -->
      <button
        ref="ctaRef"
        class="closing-cta"
        type="button"
        @mouseenter="onCtaMouseEnter"
        @mouseleave="onCtaMouseLeave"
      >
        <span class="cta-fill" aria-hidden="true"></span>
        <span class="cta-label">Gửi yêu thương</span>
      </button>
    </div>

    <!-- Footer: copyright only -->
    <footer class="site-footer">
      <p class="footer-copyright">&copy; 2025 Valentine</p>
    </footer>
  </section>
</template>

<style scoped>
/*
 * Layout: minimal-cta
 * min-height: 100dvh
 * Background: Midnight_Base
 */
.closing-section {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--color-midnight-900);
  padding-inline-start: var(--section-pad-x);
  padding-inline-end: var(--section-pad-x);
  padding-block: var(--section-pad-y);
}

/*
 * Content wrapper
 */
.closing-content {
  max-width: var(--content-max-w);
  width: 100%;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: flex-start;
}

/*
 * Text node: font-size ≤ 14px, ≤ 10 words
 */
.closing-text {
  font-family: var(--font-body);
  font-size: var(--text-sm); /* 0.875rem = 14px */
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.7;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

/*
 * CTA button: ≤ 3 words, hover fill from nearest edge
 */
.closing-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 3rem;
  border: 1px solid var(--color-crimson);
  border-radius: 0; /* all-sharp */
  background: transparent;
  color: var(--color-ivory);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap;
  transition: color 0.2s ease;
}

/* Fill element: animated by GSAP on hover */
.cta-fill {
  position: absolute;
  inset: 0;
  background: var(--color-crimson);
  transform: scaleX(0);
  transform-origin: left center;
  pointer-events: none;
}

.cta-label {
  position: relative;
  z-index: 1;
}

.closing-cta:active {
  transform: scale(0.97);
}

/*
 * Footer: copyright text only
 */
.site-footer {
  position: absolute;
  bottom: 2rem;
  left: var(--section-pad-x);
}

.footer-copyright {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-ivory);
  opacity: 0.4;
  letter-spacing: var(--tracking-normal);
}

/* ─── Tablet (768–1024px) ─────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .closing-section {
    padding-inline-start: clamp(2rem, 5vw, var(--section-pad-x));
    padding-inline-end: clamp(2rem, 5vw, var(--section-pad-x));
  }
}

/* ─── Mobile (< 768px) ────────────────────────── */
@media (max-width: 767px) {
  .closing-section {
    padding-inline-start: var(--section-pad-x-narrow);
    padding-inline-end: var(--section-pad-x-narrow);
    padding-block: 4rem;
    align-items: flex-start;
  }

  .closing-content {
    width: 100%;
    gap: 2rem;
  }

  .closing-cta {
    width: 100%;
    justify-content: center;
  }

  .site-footer {
    left: var(--section-pad-x-narrow);
  }
}

/* ─── Reduced Motion ────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .closing-text,
  .closing-cta {
    opacity: 1 !important;
    transform: none !important;
  }
}
</style>
