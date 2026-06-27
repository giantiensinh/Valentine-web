<script setup lang="ts">
import { ref, computed } from 'vue'
import { gsap } from 'gsap'
import { useIntersectionObserver } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'
import { messageHeadline, messageSubtext } from '../data/content'

const { isReduced } = useReducedMotion()
const messageSectionRef = ref<HTMLElement>()
const wordTokensRef = ref<HTMLElement[]>([])
const subtextRef = ref<HTMLElement>()
const hasRevealed = ref(false)

// Split headline into words for stagger animation
const headlineWords = computed(() => messageHeadline.split(' '))

function setWordRef(el: HTMLElement | null, index: number) {
  if (el) wordTokensRef.value[index] = el
}

// If reduced motion: words are visible immediately (final state)
// Otherwise: reveal on IntersectionObserver 50% threshold
useIntersectionObserver(
  messageSectionRef,
  ([entry]) => {
    if (!entry.isIntersecting || hasRevealed.value) return
    hasRevealed.value = true

    if (isReduced.value) return // already at final state via CSS

    const tokens = wordTokensRef.value.filter(Boolean)
    const subtext = subtextRef.value

    const tl = gsap.timeline()

    if (tokens.length) {
      tl.from(tokens, {
        opacity: 0,
        y: 20,
        stagger: 0.05,
        duration: 0.7,
        ease: 'power2.out',
      }, 0)
    }

    if (subtext) {
      tl.from(subtext, {
        opacity: 0,
        y: 16,
        duration: 0.6,
        ease: 'power2.out',
      }, 0.6)
    }
  },
  { threshold: 0.3 }
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
      <!-- Display headline: italic, word-by-word stagger reveal -->
      <h2 class="message-headline">
        <span
          v-for="(word, i) in headlineWords"
          :key="i"
          :ref="(el) => setWordRef(el as HTMLElement | null, i)"
          class="word-token"
        >{{ word }}<span class="word-space" aria-hidden="true">&nbsp;</span></span>
      </h2>

      <!-- Subtext: Typography_Body, ≤ 3 lines ≤ 80 chars, opacity 0.7 -->
      <p ref="subtextRef" class="message-subtext">{{ messageSubtext }}</p>
    </div>
  </section>
</template>

<style scoped>
/*
 * Layout: editorial-manifesto — typography-only full-viewport
 * Background: Midnight_Base + radial Crimson gradient at center
 */
.message-section {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background-color: var(--color-midnight-900);
  background-image: radial-gradient(
    ellipse 50vw 50vw at 50% 50%,
    hsl(350 65% 42% / 0.12) 0%,
    transparent 100%
  );
  overflow: hidden;
  /* Symmetric padding — chữ không bị cắt ở hai bên */
  padding-inline: var(--section-pad-x);
  padding-block: var(--section-pad-y);
}

/*
 * Content wrapper: max-width 1400px
 */
.message-content {
  max-width: var(--content-max-w);
  width: 100%;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  /* Allow overflow so animated words don't clip */
  overflow: visible;
}

/*
 * Display headline: Typography_Display, min 3rem mobile / 5rem desktop
 * overflow: visible ensures italic descenders and stagger animations show fully
 */
.message-headline {
  font-family: var(--font-display);
  /* Responsive font size: nhỏ hơn để không tràn viewport */
  font-size: clamp(var(--text-4xl), 4.5vw, 4.5rem);
  font-weight: 300;
  font-style: italic;
  line-height: 1.2;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  /* Allow natural wrapping — no fixed max-width that clips long Vietnamese text */
  max-width: 100%;
  /* Ensure long words wrap, don't overflow */
  word-wrap: break-word;
  overflow-wrap: break-word;
  /* Reserve space for italic descenders */
  padding-bottom: 0.5rem;
  /* Critical: visible overflow so word tokens animate without clipping */
  overflow: visible;
}

.word-token {
  display: inline;
}

.word-space {
  display: inline;
}

/*
 * Subtext: Typography_Body, opacity 0.7
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
 * Reduced motion: all text at final visual state immediately
 */
.message-section--reduced .word-token,
.message-section--reduced .message-subtext {
  opacity: 1 !important;
  transform: none !important;
}

/* ─── Tablet (768–1024px) ─────────────────────── */
@media (min-width: 768px) and (max-width: 1024px) {
  .message-section {
    padding-inline-start: clamp(2rem, 5vw, var(--section-pad-x));
    padding-inline-end: clamp(2rem, 5vw, var(--section-pad-x));
  }

  .message-headline {
    font-size: clamp(var(--text-4xl), 5.5vw, var(--text-5xl));
    max-width: 100%;
  }
}

/* ─── Mobile (< 768px) ────────────────────────── */
@media (max-width: 767px) {
  .message-section {
    padding-inline-start: var(--section-pad-x-narrow);
    padding-inline-end: var(--section-pad-x-narrow);
    padding-block: 4rem;
    align-items: flex-start;
  }

  .message-headline {
    font-size: var(--text-5xl); /* 3rem — mobile minimum */
    max-width: 100%;
  }
}
</style>
