<script setup lang="ts">
/**
 * MeshGradient: Animated mesh gradient background using canvas.
 * 5 color stops drift slowly around the canvas — creates organic
 * flowing gradient effect. Runs as RAF loop.
 *
 * Props:
 *   intensity: 0–1, how vivid the colors are (default 0.5)
 */
import { ref, onMounted, onUnmounted } from 'vue'
import { useReducedMotion } from '../composables/useReducedMotion'

defineProps<{ intensity?: number }>()

const { isReduced } = useReducedMotion()
const canvasRef = ref<HTMLCanvasElement>()

let rafId: number | null = null
let t = 0
let w = 0, h = 0

interface Stop {
  x: number; y: number         // current 0–1 position
  vx: number; vy: number       // velocity
  hue: number; sat: number; lig: number
  radius: number
}

const STOPS: Stop[] = [
  { x: 0.2, y: 0.3, vx: 0.0003, vy: 0.0002, hue: 350, sat: 70, lig: 30, radius: 0.55 },
  { x: 0.8, y: 0.2, vx: -0.0002, vy: 0.0003, hue: 320, sat: 60, lig: 25, radius: 0.5  },
  { x: 0.5, y: 0.7, vx: 0.0001, vy: -0.0002, hue: 0,   sat: 65, lig: 28, radius: 0.45 },
  { x: 0.1, y: 0.8, vx: 0.0002, vy: -0.0001, hue: 280, sat: 50, lig: 22, radius: 0.4  },
  { x: 0.9, y: 0.6, vx: -0.0001, vy: 0.0002, hue: 30,  sat: 55, lig: 25, radius: 0.42 },
]

function draw(ctx: CanvasRenderingContext2D) {
  ctx.clearRect(0, 0, w, h)

  for (const s of STOPS) {
    // Drift with sin/cos for organic movement
    s.x += Math.sin(t * 0.7 + s.hue) * s.vx
    s.y += Math.cos(t * 0.5 + s.hue) * s.vy
    // Bounce off edges
    if (s.x < 0 || s.x > 1) s.vx *= -1
    if (s.y < 0 || s.y > 1) s.vy *= -1

    const grd = ctx.createRadialGradient(
      s.x * w, s.y * h, 0,
      s.x * w, s.y * h, s.radius * Math.max(w, h)
    )
    grd.addColorStop(0, `hsla(${s.hue}, ${s.sat}%, ${s.lig}%, 0.22)`)
    grd.addColorStop(1, `hsla(${s.hue}, ${s.sat}%, ${s.lig}%, 0)`)
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, w, h)
  }

  t += 0.012
}

function resize() {
  const c = canvasRef.value
  if (!c) return
  w = c.offsetWidth
  h = c.offsetHeight
  c.width = w
  c.height = h
}

onMounted(() => {
  const c = canvasRef.value
  if (!c || isReduced.value) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  resize()
  window.addEventListener('resize', resize)

  function frame() {
    draw(ctx!)
    rafId = requestAnimationFrame(frame)
  }
  rafId = requestAnimationFrame(frame)
})

onUnmounted(() => {
  window.removeEventListener('resize', resize)
  if (rafId !== null) cancelAnimationFrame(rafId)
})
</script>

<template>
  <canvas
    v-if="!isReduced"
    ref="canvasRef"
    class="mesh-gradient"
    aria-hidden="true"
  />
</template>

<style scoped>
.mesh-gradient {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  /* Grain texture via SVG filter for noise film effect */
  filter: url(#grain);
}
</style>
