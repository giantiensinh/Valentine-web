<script setup lang="ts">
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

// heroRef will be passed in from App.vue pointing at the HeroSection root element.
// When the hero is intersecting the viewport, the nav stays transparent.
// Once the hero scrolls out of view, the nav gets a semi-opaque backdrop.
const props = defineProps<{
  heroRef?: HTMLElement | null
}>()

// true while the hero section is still overlapping the viewport
const isHeroVisible = ref(true)

useIntersectionObserver(
  () => props.heroRef ?? null,
  ([entry]) => {
    isHeroVisible.value = entry?.isIntersecting ?? true
  },
  { threshold: 0.1 }
)

function scrollToClosing() {
  const closing = document.querySelector<HTMLElement>('[aria-label="Closing"]')
  if (!closing) return
  closing.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <nav
    class="navbar"
    :class="{ 'navbar--scrolled': !isHeroVisible }"
    aria-label="Main navigation"
  >
    <!-- Logo mark — left side -->
    <a href="#" class="navbar-logo" aria-label="Valentine — home">
      <span class="navbar-logo-mark" aria-hidden="true">♡</span>
      <span class="navbar-logo-text">Valentine</span>
    </a>

    <!-- CTA button — right side: scrolls to closing/contact section -->
    <button class="navbar-cta" type="button" @click="scrollToClosing">
      Gửi yêu thương
    </button>
  </nav>
</template>

<style scoped>
/* ─── Layout ──────────────────────────────────── */
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: nowrap;    /* all elements stay on one row ≥ 768px (Req 9.2) */
  white-space: nowrap;
  padding-inline: var(--section-pad-x);
  z-index: var(--z-nav);

  /* transparent while hero is visible — opacity < 0.9 as required */
  background-color: transparent;
  transition: background-color 0.3s ease, backdrop-filter 0.3s ease;
}

/* Semi-opaque once hero has scrolled out of view */
.navbar--scrolled {
  background-color: hsla(225, 42%, 8%, 0.85); /* opacity 0.85 < 0.9 ✓ */
  backdrop-filter: blur(8px);
}

/* ─── Logo ────────────────────────────────────── */
.navbar-logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-ivory);
  text-decoration: none;
  white-space: nowrap;
}

.navbar-logo-mark {
  font-size: 1.25rem;
  color: var(--color-crimson-light);
  line-height: 1;
  display: inline-block;
  animation: heartbeat 2.4s ease-in-out infinite;
}

@keyframes heartbeat {
  0%, 100% { transform: scale(1); }
  14%       { transform: scale(1.25); }
  28%       { transform: scale(1); }
  42%       { transform: scale(1.18); }
  56%       { transform: scale(1); }
}

.navbar-logo-text {
  font-family: var(--font-display);
  font-size: var(--text-lg);
  font-weight: 400;
  letter-spacing: var(--tracking-normal);
}

/* ─── CTA ─────────────────────────────────────── */
.navbar-cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1.5rem;
  border: 1px solid var(--color-crimson);
  border-radius: 0; /* all-sharp per Req 2.6 */
  background: transparent;
  color: var(--color-ivory);
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.navbar-cta:hover {
  background-color: var(--color-crimson);
  color: var(--color-ivory);
}

.navbar-cta:active {
  transform: scale(0.96);
}

/* ─── Responsive ──────────────────────────────── */
@media (max-width: 767px) {
  .navbar {
    height: 60px;
    padding-inline: var(--section-pad-x-narrow);
  }

  .navbar-logo-text {
    font-size: var(--text-base);
  }
}
</style>
