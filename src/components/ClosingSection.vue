<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { useIntersectionObserver } from '@vueuse/core'
import { useReducedMotion } from '../composables/useReducedMotion'
import ConfettiOverlay from './ConfettiOverlay.vue'

const { isReduced } = useReducedMotion()
const sectionRef = ref<HTMLElement>()
const ctaRef = ref<HTMLElement>()
const closingTextRef = ref<HTMLElement>()
const typingRef = ref<HTMLElement>()
const canvasRef = ref<HTMLCanvasElement>()
const confettiRef = ref<InstanceType<typeof ConfettiOverlay>>()
const hasFadedIn = ref(false)
const hasTyped = ref(false)
const typingDone = ref(false)

// ─── Typing animation ─────────────────────────────
const TYPING_TEXT = 'Em có muốn làm Valentine của tôi không? ❤'

function startTyping() {
  if (hasTyped.value || isReduced.value || !typingRef.value) return
  hasTyped.value = true
  const el = typingRef.value
  el.textContent = ''
  let i = 0

  // Use [...text] to handle emoji correctly
  const chars = [...TYPING_TEXT]

  function typeNext() {
    if (i >= chars.length) {
      typingDone.value = true
      return
    }
    el.textContent += chars[i]
    i++
    const delay = chars[i - 1] === ' ' ? 60 : chars[i - 1] === ',' ? 200 : 55
    setTimeout(typeNext, delay + Math.random() * 30)
  }
  typeNext()
}

// ─── Aurora canvas ────────────────────────────────
let rafId: number | null = null
let t = 0

function initAurora() {
  const canvas = canvasRef.value
  if (!canvas || isReduced.value) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  function resize() {
    if (!canvas) return
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight
  }
  resize()
  window.addEventListener('resize', resize)

  function draw() {
    if (!canvas || !ctx) return
    const w = canvas.width, h = canvas.height
    ctx.clearRect(0, 0, w, h)
    t += 0.004

    const blobs = [
      { x: 0.35 + Math.sin(t * 0.7) * 0.15, y: 0.5 + Math.cos(t * 0.5) * 0.2, r: 0.45, hue: 350, sat: 65, lig: 35, a: 0.14 },
      { x: 0.65 + Math.cos(t * 0.6) * 0.12, y: 0.45 + Math.sin(t * 0.8) * 0.15, r: 0.38, hue: 320, sat: 55, lig: 30, a: 0.11 },
      { x: 0.5  + Math.sin(t * 0.9) * 0.1,  y: 0.6  + Math.cos(t * 0.4) * 0.1,  r: 0.30, hue: 10,  sat: 70, lig: 40, a: 0.09 },
    ]
    for (const b of blobs) {
      const grd = ctx.createRadialGradient(b.x*w, b.y*h, 0, b.x*w, b.y*h, b.r*Math.max(w,h))
      grd.addColorStop(0, `hsla(${b.hue},${b.sat}%,${b.lig}%,${b.a})`)
      grd.addColorStop(1, `hsla(${b.hue},${b.sat}%,${b.lig}%,0)`)
      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)
    }
    rafId = requestAnimationFrame(draw)
  }
  rafId = requestAnimationFrame(draw)

  return () => {
    window.removeEventListener('resize', resize)
    if (rafId !== null) cancelAnimationFrame(rafId)
  }
}

// ─── Entrance animation + trigger typing ─────────
useIntersectionObserver(
  sectionRef,
  ([entry]) => {
    if (!entry.isIntersecting) return
    if (!hasFadedIn.value) {
      hasFadedIn.value = true
      if (!isReduced.value) {
        const tl = gsap.timeline()
        if (closingTextRef.value) tl.from(closingTextRef.value, { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out' }, 0)
        if (ctaRef.value) tl.from(ctaRef.value, { opacity: 0, y: 24, duration: 0.8, ease: 'power2.out' }, 0.3)
        tl.call(startTyping, [], 0.6)
      } else {
        // Reduced: show typing text immediately
        if (typingRef.value) typingRef.value.textContent = TYPING_TEXT
        typingDone.value = true
      }
    }
  },
  { threshold: 0.3 }
)

// ─── CTA hover fill ───────────────────────────────
function onCtaMouseEnter(e: MouseEvent) {
  if (!ctaRef.value) return
  const rect = ctaRef.value.getBoundingClientRect()
  const fromLeft = e.clientX - rect.left < rect.width / 2
  const fillEl = ctaRef.value.querySelector<HTMLElement>('.cta-fill')
  if (!fillEl) return
  gsap.to(ctaRef.value, { scale: 1.04, rotate: '1deg', duration: 0.2, ease: 'power2.out' })
  gsap.fromTo(fillEl,
    { scaleX: 0, transformOrigin: fromLeft ? 'left center' : 'right center' },
    { scaleX: 1, duration: 0.28, ease: 'power2.out' }
  )
}

function onCtaMouseLeave() {
  const fillEl = ctaRef.value?.querySelector<HTMLElement>('.cta-fill')
  if (!fillEl) return
  if (ctaRef.value) gsap.to(ctaRef.value, { scale: 1, rotate: '0deg', duration: 0.2, ease: 'power2.out' })
  gsap.to(fillEl, { scaleX: 0, duration: 0.2, ease: 'power2.in' })
}

// ─── CTA click → confetti ─────────────────────────
function onCtaClick(e: MouseEvent) {
  // Ripple
  if (!ctaRef.value || isReduced.value) return
  const rect = ctaRef.value.getBoundingClientRect()
  const ripple = document.createElement('span')
  ripple.style.cssText = `
    position:absolute;left:${e.clientX-rect.left}px;top:${e.clientY-rect.top}px;
    width:8px;height:8px;border-radius:50%;
    background:hsl(48 22% 92% / 0.4);
    transform:translate(-50%,-50%) scale(0);pointer-events:none;
  `
  ctaRef.value.appendChild(ripple)
  gsap.to(ripple, { scale: 20, opacity: 0, duration: 0.7, ease: 'power2.out', onComplete: () => ripple.remove() })

  // Confetti burst
  confettiRef.value?.burst(e.clientX, e.clientY)
}

let cleanupAurora: (() => void) | undefined
onMounted(() => { cleanupAurora = initAurora() })
onUnmounted(() => { cleanupAurora?.() })
</script>

<template>
  <section
    ref="sectionRef"
    class="closing-section"
    aria-label="Closing"
  >
    <canvas v-if="!isReduced" ref="canvasRef" class="aurora-canvas" aria-hidden="true" />
    <ConfettiOverlay ref="confettiRef" />

    <div class="closing-content">
      <p ref="closingTextRef" class="closing-text">Mãi mãi, chỉ là em thôi.</p>

      <!-- Typing question -->
      <p
        ref="typingRef"
        class="closing-typing"
        :class="{ 'show-cursor': !typingDone }"
        aria-live="polite"
      ></p>

      <button
        ref="ctaRef"
        class="closing-cta"
        type="button"
        @mouseenter="onCtaMouseEnter"
        @mouseleave="onCtaMouseLeave"
        @click="onCtaClick"
      >
        <span class="cta-fill" aria-hidden="true"></span>
        <span class="cta-label">Gửi yêu thương ❤</span>
      </button>
    </div>

    <footer class="site-footer">
      <p class="footer-copyright">&copy; 2025 Valentine</p>
    </footer>
  </section>
</template>

<style scoped>
.closing-section {
  position: relative;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  background-color: var(--color-midnight-900);
  padding-inline: var(--section-pad-x);
  padding-block: var(--section-pad-y);
  overflow: hidden;
}

.aurora-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.closing-content {
  position: relative;
  z-index: 1;
  max-width: var(--content-max-w);
  width: 100%;
  margin-inline: auto;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: flex-start;
}

.closing-text {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.7;
  letter-spacing: var(--tracking-wide);
  text-transform: uppercase;
}

/* Typing animation text */
.closing-typing {
  font-family: var(--font-display);
  font-size: clamp(1.4rem, 3vw, 2.5rem);
  font-weight: 300;
  font-style: italic;
  line-height: 1.3;
  color: var(--color-ivory);
  min-height: 1.3em;
  letter-spacing: var(--tracking-tight);
}

/* Blinking cursor while typing */
.closing-typing.show-cursor::after {
  content: '|';
  color: var(--color-crimson-light);
  animation: blink-cursor 0.7s step-end infinite;
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0; }
}

.closing-cta {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 3rem;
  border: 1px solid var(--color-crimson);
  border-radius: 0;
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
  transition: box-shadow 0.25s ease;
}

.closing-cta:hover {
  box-shadow: 0 0 24px hsl(350 65% 42% / 0.4);
}

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

.closing-cta:active { transform: scale(0.97); }

.site-footer {
  position: absolute;
  bottom: 2rem;
  left: var(--section-pad-x);
  z-index: 1;
}

.footer-copyright {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  color: var(--color-ivory);
  opacity: 0.4;
  letter-spacing: var(--tracking-normal);
}

@media (min-width: 768px) and (max-width: 1024px) {
  .closing-section { padding-inline: clamp(2rem, 5vw, var(--section-pad-x)); }
}

@media (max-width: 767px) {
  .closing-section { padding-inline: var(--section-pad-x-narrow); padding-block: 4rem; }
  .closing-content { gap: 1.5rem; }
  .closing-cta { width: 100%; justify-content: center; }
  .site-footer { left: var(--section-pad-x-narrow); }
  .closing-typing { font-size: clamp(1.1rem, 5vw, 1.6rem); }
}

@media (prefers-reduced-motion: reduce) {
  .closing-text, .closing-cta { opacity: 1 !important; transform: none !important; }
  .closing-typing.show-cursor::after { animation: none; }
}
</style>
