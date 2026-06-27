<script setup lang="ts">
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import { useIntersectionObserver } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'
import { messageHeadline, messageSubtext } from '../data/content'

const { isReduced } = useReducedMotion()
const messageSectionRef = ref<HTMLElement>()
const wordTokensRef = ref<HTMLElement[]>([])
const hasRevealed = ref(false)

// Split headline into words for stagger animation
const headlineWords = computed(() => messageHeadline.split(' '))

function setWordRef(el: HTMLElement | null, index: number) {
  if (el) wordTokensRef.value[index] = el
}

// If reduced motion: words are visible immediately (final state) — Req 7.7
// Otherwise: reveal on IntersectionObserver 50% threshold — Req 7.3
useIntersectionObserver(
  messageSectionRef,
  ([entry]) => {
    if (!entry.isIntersecting || hasRevealed.value) return
    hasRevealed.value = true

    if (isReduced.value) return // already at final state via CSS

    const tokens = wordTokensRef.value.filter(Boolean)
    if (!tokens.length) return

    gsap.from(tokens, {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      duration: 0.6,
      ease: 'power2.out',
    })
  },
  { threshold: 0.5 }
)
</script>

<template>
  <section
    ref="messageSectionRef"
    class="message-section"
    :class="{ 'message-section--reduced': isReduced }"
    aria-label="Message"
  >
    <div class="message-content">
      <!-- Display headline: italic key words, Typography_Display (Req 7.2) -->
      <h2 class="message-headline">
        <span
          v-for="(word, i) in headlineWords"
          :key="i"
          :ref="(el) => setWordRef(el as HTMLElement | null, i)"
          class="word-token"
        >{{ word }}<span class="word-space" aria-hidden="true">&nbsp;</span></span>
      </h2>

      <!-- Subtext: Typography_Body, ≤ 3 lines ≤ 80 chars, opacity 0.7 (Req 7.6) -->
      <p class="message-subtext">{{ messageSubtext }}</p>
    </div>
  </section>
</template>

<style scoped>
/*
 * Layout: editorial-manifesto — typography-only full-viewport (Req 7.1)
 * Background: Midnight_Base + radial Crimson gradient at center (Req 7.4)
 */
.message-section {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--color-midnight-900);
  background-image: radial-gradient(
    ellipse 40vw 40vw at 50% 50%,
    hsl(350 65% 42% / 0.15) 0%,
    transparent 100%
  );
  overflow: hidden;
  /* Asymmetric inline padding: left = 8vw, right = 0 (Req 9.6) */
  padding-inline-start: var(--section-pad-x);
  padding-inline-end: 0;
  padding-block: var(--section-pad-y);
}

/*
 * Content wrapper: max-width 1400px, centered with margin-inline: auto (Req 9.6)
 */
.message-content {
  max-width: var(--content-max-w);
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/*
 * Display headline: Typography_Display, min 3rem mobile / 5rem desktop (Req 7.2)
 * Italic applied via font-style: italic on entire headline;
 * uses the Cormorant Garamond italic variant (Req 7.2)
 */
.message-headline {
  font-family: var(--font-display);
  font-size: clamp(var(--text-5xl), 6vw, 5rem);
  font-weight: 300;
  font-style: italic;
  line-height: var(--leading-snug); /* 1.1 — satisfies Req 3.4 for descenders */
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  padding-bottom: 0.25rem; /* reserve for italic descenders (Req 3.4) */
  max-width: 18ch;
}

.word-token {
  display: inline;
}

.word-space {
  display: inline;
}

/*
 * Subtext: Typography_Body, opacity 0.7, positioned after headline (Req 7.6)
 * ≤ 80 chars ensures ≤ 3 lines at 768px+
 */
.message-subtext {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.7;
  max-width: 40ch;
}

/*
 * Reduced motion: all text at final visual state immediately (Req 7.7, 9.9)
 */
.message-section--reduced .word-token {
  opacity: 1;
  transform: none;
}

/* ─── Mobile (Req 9.7) ────────────────────────────────────── */
/*
 * Below 768px: collapse to single column, 1rem padding each side.
 */
@media (max-width: 767px) {
  .message-section {
    padding-inline-start: var(--section-pad-x-narrow);
    padding-inline-end: var(--section-pad-x-narrow);
    padding-block: 4rem;
    align-items: flex-start;
  }

  .message-headline {
    font-size: var(--text-5xl); /* 3rem — mobile minimum (Req 7.2) */
    max-width: 100%;
  }
}
</style>
