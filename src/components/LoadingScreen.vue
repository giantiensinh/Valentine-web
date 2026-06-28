<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { useReducedMotion } from '../composables/useReducedMotion'

const emit = defineEmits<{ done: [] }>()
const { isReduced } = useReducedMotion()

const wrapperRef = ref<HTMLElement>()
const heartRef = ref<HTMLElement>()
const textRef = ref<HTMLElement>()

onMounted(() => {
  if (isReduced.value) {
    emit('done')
    return
  }

  const tl = gsap.timeline({
    onComplete: () => {
      if (!wrapperRef.value) { emit('done'); return }
      gsap.to(wrapperRef.value, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.in',
        onComplete: () => emit('done'),
      })
    },
  })

  if (heartRef.value) {
    tl.from(heartRef.value, { scale: 0, opacity: 0, duration: 0.5, ease: 'back.out(2)' })
    tl.to(heartRef.value, { scale: 1.35, duration: 0.15, ease: 'power2.out' }, '+=0.1')
    tl.to(heartRef.value, { scale: 1,    duration: 0.15, ease: 'power2.in'  })
    tl.to(heartRef.value, { scale: 1.2,  duration: 0.12, ease: 'power2.out' }, '+=0.08')
    tl.to(heartRef.value, { scale: 1,    duration: 0.12, ease: 'power2.in'  })
  }

  if (textRef.value) {
    tl.from(textRef.value, { opacity: 0, y: 10, duration: 0.4, ease: 'power2.out' }, '-=0.1')
  }

  tl.to({}, { duration: 0.5 })
})
</script>

<template>
  <Transition name="loading-fade" appear>
    <div ref="wrapperRef" class="loading-screen" aria-live="polite" aria-label="Đang tải...">
      <div class="loading-inner">
        <span ref="heartRef" class="loading-heart" aria-hidden="true">♥</span>
        <p ref="textRef" class="loading-text">Loading...</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background-color: var(--color-midnight-900);
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-heart {
  font-size: 3.5rem;
  color: var(--color-crimson-light);
  display: block;
  line-height: 1;
  filter: drop-shadow(0 0 20px hsl(350 65% 55% / 0.6));
}

.loading-text {
  font-family: var(--font-body);
  font-size: var(--text-xs);
  font-weight: 500;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--color-ivory);
  opacity: 0.5;
}

/* Vue Transition for the overlay itself */
.loading-fade-leave-active {
  transition: opacity 0.5s ease;
}
.loading-fade-leave-to {
  opacity: 0;
}
</style>
