<script setup lang="ts">
import { ref, watch } from 'vue'
import { gsap } from 'gsap'

const props = defineProps<{
  play: boolean
  isReduced: boolean
}>()

const hasPlayed = ref(false)
const svgRef = ref<SVGSVGElement>()

/**
 * Animates all petal paths by drawing their strokes from 0 to full length.
 * Guards idempotency via hasPlayed — fires at most once per session.
 */
function animateBloom(isReduced: boolean): void {
  if (hasPlayed.value) return
  hasPlayed.value = true

  if (!svgRef.value) return
  const paths = Array.from(
    svgRef.value.querySelectorAll<SVGPathElement>('.petal-path')
  )

  if (isReduced) {
    // Reduced motion: set final state immediately in one frame
    paths.forEach((p) => {
      const len = p.getTotalLength()
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: 0 })
    })
    const center = svgRef.value.querySelector<SVGCircleElement>('.bloom-center')
    if (center) gsap.set(center, { scale: 1, opacity: 1, transformOrigin: '50% 50%' })
    return
  }

  // Set up dasharray = full path length, dashoffset = full length (hidden)
  paths.forEach((p) => {
    const len = p.getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
  })

  // Center dot: start hidden, pop in after petals finish drawing
  const center = svgRef.value.querySelector<SVGCircleElement>('.bloom-center')
  if (center) gsap.set(center, { scale: 0, opacity: 0, transformOrigin: '50% 50%' })

  // Animate dashoffset → 0, all within 1.5s window
  // stagger 0.05 × (5-1) = 0.2s — well within 1.5s duration
  gsap.to(paths, {
    strokeDashoffset: 0,
    duration: 1.5,
    ease: 'power2.inOut',
    stagger: 0.05,
  })

  // Center dot pops in after petals are mostly drawn
  if (center) {
    gsap.to(center, {
      scale: 1,
      opacity: 1,
      duration: 0.35,
      delay: 1.3,
      ease: 'back.out(2)',
      transformOrigin: '50% 50%',
    })
  }
}

// Watch play prop — trigger animation when set to true
watch(
  () => props.play,
  (val) => {
    if (val) animateBloom(props.isReduced)
  },
  { immediate: true }
)
</script>

<template>
  <div class="bloom-wrapper" aria-hidden="true">
    <svg
      ref="svgRef"
      class="bloom-svg"
      viewBox="-100 -100 200 200"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
    >
      <!-- Petal 1: top -->
      <path
        class="petal-path"
        d="M 0 0 C 15 -30 15 -70 0 -80 C -15 -70 -15 -30 0 0"
        stroke="hsl(350, 65%, 55%)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <!-- Petal 2: top-right (72°) -->
      <path
        class="petal-path"
        d="M 0 0 C 28 -15 60 -25 76 -15 C 65 0 35 10 0 0"
        stroke="hsl(350, 62%, 50%)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <!-- Petal 3: bottom-right (144°) -->
      <path
        class="petal-path"
        d="M 0 0 C 20 20 40 55 25 70 C 5 60 -15 30 0 0"
        stroke="hsl(352, 60%, 48%)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <!-- Petal 4: bottom-left (216°) -->
      <path
        class="petal-path"
        d="M 0 0 C -20 20 -40 55 -25 70 C -5 60 15 30 0 0"
        stroke="hsl(348, 63%, 52%)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />
      <!-- Petal 5: top-left (288°) -->
      <path
        class="petal-path"
        d="M 0 0 C -28 -15 -60 -25 -76 -15 C -65 0 -35 10 0 0"
        stroke="hsl(350, 65%, 55%)"
        stroke-width="1.5"
        stroke-linecap="round"
        fill="none"
      />

      <!-- Center dot: starts hidden, animated in after petals complete -->
      <circle
        cx="0"
        cy="0"
        r="5"
        fill="hsl(350, 65%, 42%)"
        class="bloom-center"
        style="opacity: 0;"
      />
    </svg>
  </div>
</template>

<style scoped>
.bloom-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 4rem var(--section-pad-x);
  background-color: var(--color-midnight-900);
}

.bloom-svg {
  width: clamp(200px, 30vw, 400px);
  height: clamp(200px, 30vw, 400px);
  overflow: visible;
}

/* NO CSS transition or animation on .petal-path — GSAP only */
</style>
