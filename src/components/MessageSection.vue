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
const hasRevealed = ref(false)

// Tách headline thành 2 dòng cố định — tránh tràn viewport
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
  },
  { threshold: 0.25 }
)

// Hiệu ứng trái tim nổi lên — tạo động bằng GSAP
let heartCtx: gsap.Context | null = null

function spawnHeart() {
  if (!heartsRef.value || isReduced.value) return

  const heart = document.createElement('span')
  heart.textContent = Math.random() > 0.5 ? '♥' : '♡'
  heart.className = 'floating-heart'

  // Vị trí ngẫu nhiên theo chiều ngang
  const x = Math.random() * 100
  const size = Math.random() * 1.2 + 0.6  // 0.6–1.8rem
  const hue = Math.random() > 0.6 ? 350 : 0  // crimson hoặc đỏ thuần
  const lightness = Math.random() * 20 + 45   // 45–65%

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
      y: -(Math.random() * 220 + 120),  // nổi lên 120–340px
      scale: 1,
      duration: Math.random() * 2.5 + 2.5,  // 2.5–5s
      ease: 'power1.out',
      onComplete: () => {
        heart.remove()
      },
    }
  )

  // Fade out ở nửa cuối hành trình
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
  // Spawn trái tim mỗi 600ms
  spawnInterval = setInterval(spawnHeart, 600)
  // Spawn ngay lập tức vài cái ban đầu
  setTimeout(spawnHeart, 200)
  setTimeout(spawnHeart, 500)
  setTimeout(spawnHeart, 900)
})

onUnmounted(() => {
  if (spawnInterval) clearInterval(spawnInterval)
  heartCtx?.revert()
})
</script>

<template>
  <section
    ref="messageSectionRef"
    class="message-section"
    :class="{ 'message-section--reduced': isReduced }"
    aria-label="Message"
  >
    <!-- Container trái tim nổi — nằm dưới text -->
    <div ref="heartsRef" class="hearts-field" aria-hidden="true"></div>

    <div class="message-content">
      <!-- Dòng 1 -->
      <h2 class="message-headline">
        <span ref="line1Ref" class="headline-line">{{ line1 }}</span>
        <span ref="line2Ref" class="headline-line headline-line--indent">{{ line2 }}</span>
      </h2>

      <!-- Subtext -->
      <p ref="subtextRef" class="message-subtext">{{ messageSubtext }}</p>
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
  background-color: var(--color-midnight-900);
  background-image: radial-gradient(
    ellipse 60vw 60vw at 50% 60%,
    hsl(350 65% 35% / 0.18) 0%,
    transparent 70%
  );
  overflow: hidden;
  padding-inline: var(--section-pad-x);
  padding-block: var(--section-pad-y);
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
  max-width: 680px;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ─── Headline ─────────────────────────────────── */
.message-headline {
  font-family: var(--font-display);
  font-weight: 300;
  font-style: italic;
  line-height: 1.3;
  letter-spacing: var(--tracking-tight);
  color: var(--color-ivory);
  display: flex;
  flex-direction: column;
  gap: 0.25em;
}

.headline-line {
  display: block;
  font-size: clamp(1.5rem, 3.2vw, 3.5rem);
}

/* Dòng 2 thụt vào một chút để tạo nhịp điệu editorial */
.headline-line--indent {
  padding-left: clamp(1rem, 4vw, 3rem);
  opacity: 0.9;
}

/* ─── Subtext ──────────────────────────────────── */
.message-subtext {
  font-family: var(--font-body);
  font-size: var(--text-base);
  line-height: var(--leading-normal);
  color: var(--color-ivory);
  opacity: 0.65;
  max-width: 38ch;
}

/* ─── Reduced motion ───────────────────────────── */
.message-section--reduced .headline-line,
.message-section--reduced .message-subtext {
  opacity: 1 !important;
  transform: none !important;
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
    /* 5.5vw trên 390px = ~21px = 1.3rem — vừa đủ, không tràn */
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
}
</style>
