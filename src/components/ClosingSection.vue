<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { useIntersectionObserver } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'

const { isReduced } = useReducedMotion()
const sectionRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const hasFadedIn = ref(false)

// Fade in content (not the whole section) on intersection — fires once
useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (!entry.isIntersecting || isReduced.value || hasFadedIn.value) return
    hasFadedIn.value = true
    const content = sectionRef.value?.querySelector<HTMLElement>('.closing-content')
    if (!content) return
    gsap.from(content, {
      opacity: 0,
      y: 24,
      duration: 0.8,
      ease: 'power2.out',
    })
  },
  { threshold: 0.3 }
)

// CTA hover fill animation: fill from nearest edge (Req 11.5)
function onCtaMouseEnter(e: MouseEvent) {
  if (!ctaRef.value) return
  const rect = ctaRef.value.getBoundingClientRect()
  const fromLeft = e.clientX - rect.left < rect.width / 2
  const pseudo = ctaRef.value.querySelector<HTMLElement>('.cta-fill')
  if (!pseudo) return
  gsap.fromTo(
    pseudo,
    { scaleX: 0, transformOrigin: fromLeft ? 'left center' : 'right center' },
    { scaleX: 1, duration: 0.28, ease: 'power2.out' }
  )
}

function onCtaMouseLeave() {
  const pseudo = ctaRef.value?.querySelector<HTMLElement>('.cta-fill')
  if (!pseudo) return
  gsap.to(pseudo, { scaleX: 0, duration: 0.2, ease: 'power2.in' })
}
</script>

<template>
  <section
    ref="sectionRef"
    class="closing-section"
    aria-label="Closing"
  >
    <div class="closing-content">
      <!-- Exactly 2 visible elements: text node + CTA button (Req 11.1) -->
      <!-- Text: ≤ 14px, ≤ 10 words (Req 11.1) -->
      <p class="closing-text">Mãi mãi, chỉ là em thôi.</p>

      <!-- CTA: ≤ 3 words label (Req 11.2), hover fill animation (Req 11.5) -->
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

    <!-- Footer: copyright only, no navigation or additional elements (Req 11.7) -->
    <footer class="site-footer">
      <p class="footer-copyright">&copy; 2025 Valentine</p>
    </footer>
  </section>
</template>

<style scoped>
/*
 * Layout: minimal-cta
 * min-height: 100vh (Req 11.1)
 * Background: Midnight_Base (Req 2.2)
 */
.closing-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--color-midnight-900);
  /* Asymmetric inline padding (Req 9.6): left = 8vw, right = 0 */
  padding-inline-start: var(--section-pad-x);
  padding-inline-end: 0;
  padding-block: var(--section-pad-y);
}

/*
 * Content wrapper: max-width 1400px, centered (Req 9.6)
 */
.closing-content {
  max-width: var(--content-max-w);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  align-items: flex-start;
}

/*
 * Text node: font-size ≤ 14px, ≤ 10 words (Req 11.1)
 */
.closing-text {
  font-family: var(--font-body);
  font-size: var(--text-sm); /* 0.875rem = 14px ≤ 14px ✓ */
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.7;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

/*
 * CTA button: ≤ 3 words, hover fill from nearest edge (Req 11.2, 11.3, 11.5)
 */
.closing-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 3rem;
  border: 1px solid var(--color-crimson);
  border-radius: 0; /* all-sharp per Req 2.6 */
  background: transparent;
  color: var(--color-ivory);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  cursor: pointer;
  overflow: hidden;
  white-space: nowrap; /* ensure label stays on one line at ≥ 1024px (Req 11.3) */
}

/* Fill element: animated by GSAP on hover (Req 11.5) */
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
 * Footer: copyright text only (Req 11.7)
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

/* ─── Mobile (Req 9.7) ────────────────────────────────────── */
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
</style>
