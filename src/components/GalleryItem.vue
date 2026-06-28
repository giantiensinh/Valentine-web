<script setup lang="ts">
import { ref } from 'vue'
import { gsap } from 'gsap'
import { useTiltEffect } from '../composables/useTiltEffect'
import { useReducedMotion } from '../composables/useReducedMotion'
import type { GalleryItemData } from '../types/index'

const props = defineProps<{
  item: GalleryItemData
  index?: number
}>()

const { isReduced } = useReducedMotion()
const cardWrapperRef = ref<HTMLElement>()
const captionRef = ref<HTMLElement>()
const svgArtRef = ref<SVGSVGElement>()

useTiltEffect(cardWrapperRef)

function spawnParticles(originEl: HTMLElement): void {
  if (isReduced.value) return
  const rect = originEl.getBoundingClientRect()
  const color = props.item.color ?? 'hsl(350,65%,55%)'
  for (let i = 0; i < 12; i++) {
    const dot = document.createElement('span')
    dot.style.cssText = `
      position:fixed;width:5px;height:5px;border-radius:50%;
      background:${color};
      left:${rect.left + rect.width / 2}px;top:${rect.top + rect.height / 2}px;
      pointer-events:none;z-index:9999;
    `
    document.body.appendChild(dot)
    const angle = (i / 12) * Math.PI * 2
    const dist = 50 + Math.random() * 80
    gsap.fromTo(dot,
      { opacity: 1, scale: 1 },
      {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        opacity: 0, scale: 0.2,
        duration: 0.8 + Math.random() * 0.4,
        ease: 'power2.out',
        onComplete: () => dot.remove(),
      }
    )
  }
}

function onMouseEnter() {
  if (isReduced.value) return
  if (cardWrapperRef.value) spawnParticles(cardWrapperRef.value)
  if (svgArtRef.value) {
    gsap.to(svgArtRef.value, { scale: 1.12, duration: 0.4, ease: 'back.out(1.5)', transformOrigin: '50% 50%' })
  }
  if (captionRef.value) {
    gsap.to(captionRef.value, { y: -6, opacity: 1, duration: 0.3, ease: 'power2.out' })
  }
}

function onMouseLeave() {
  if (isReduced.value) return
  if (svgArtRef.value) {
    gsap.to(svgArtRef.value, { scale: 1, duration: 0.4, ease: 'power2.out', transformOrigin: '50% 50%' })
  }
  if (captionRef.value) {
    gsap.to(captionRef.value, { y: 0, opacity: 0.65, duration: 0.3, ease: 'power2.out' })
  }
}
</script>

<template>
  <figure class="gallery-item" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div
      ref="cardWrapperRef"
      class="gallery-card"
      :style="{ aspectRatio: item.aspectRatio }"
    >
      <!-- Animated noise overlay -->
      <div class="card-noise" aria-hidden="true"></div>

      <!-- Glow blob behind art -->
      <div
        class="card-glow-blob"
        :style="{ background: item.color ?? 'hsl(350,65%,42%)' }"
        aria-hidden="true"
      ></div>

      <!-- SVG Art — unique per card index -->
      <div class="card-art" aria-hidden="true">

        <!-- Card 0: Orbit rings + heart center -->
        <svg
          v-if="(index ?? 0) % 4 === 0"
          ref="svgArtRef"
          class="svg-art"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Orbiting rings -->
          <ellipse cx="100" cy="100" rx="70" ry="28" stroke="hsl(350,65%,55%)" stroke-width="1" stroke-dasharray="6 4" opacity="0.4">
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite"/>
          </ellipse>
          <ellipse cx="100" cy="100" rx="50" ry="20" stroke="hsl(320,60%,60%)" stroke-width="1" stroke-dasharray="4 6" opacity="0.5">
            <animateTransform attributeName="transform" type="rotate" from="60 100 100" to="-300 100 100" dur="6s" repeatCount="indefinite"/>
          </ellipse>
          <!-- Heart path -->
          <path d="M100 130 C60 110, 40 80, 60 60 C75 45, 95 52, 100 65 C105 52, 125 45, 140 60 C160 80, 140 110, 100 130 Z"
            fill="hsl(350,70%,55%)" opacity="0.9">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="scale" values="1;1.05;1" dur="2s" repeatCount="indefinite" additive="sum" accumulate="none" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1"/>
          </path>
          <!-- Center glow -->
          <circle cx="100" cy="95" r="8" fill="hsl(48,80%,85%)" opacity="0.6">
            <animate attributeName="r" values="6;10;6" dur="2s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" repeatCount="indefinite"/>
          </circle>
          <!-- Orbiting dots -->
          <circle r="3" fill="hsl(350,75%,65%)">
            <animateMotion dur="4s" repeatCount="indefinite">
              <mpath href="#orbit1"/>
            </animateMotion>
          </circle>
          <circle r="2" fill="hsl(48,80%,75%)">
            <animateMotion dur="6s" repeatCount="indefinite" begin="2s">
              <mpath href="#orbit1"/>
            </animateMotion>
          </circle>
          <path id="orbit1" d="M 30,100 A 70,28 0 1,1 170,100 A 70,28 0 1,1 30,100" fill="none"/>
        </svg>

        <!-- Card 1: Sparkle constellation -->
        <svg
          v-else-if="(index ?? 0) % 4 === 1"
          ref="svgArtRef"
          class="svg-art"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Large 4-point star -->
          <path d="M100 20 L108 92 L180 100 L108 108 L100 180 L92 108 L20 100 L92 92 Z"
            fill="hsl(48,80%,70%)" opacity="0.9">
            <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite"/>
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="20s" repeatCount="indefinite"/>
          </path>
          <!-- Medium star -->
          <path d="M100 55 L104 93 L142 100 L104 107 L100 145 L96 107 L58 100 L96 93 Z"
            fill="hsl(350,65%,60%)" opacity="0.7">
            <animateTransform attributeName="transform" type="rotate" from="45 100 100" to="-315 100 100" dur="15s" repeatCount="indefinite"/>
          </path>
          <!-- Sparkle dots around -->
          <circle cx="50" cy="50" r="3" fill="hsl(48,80%,80%)">
            <animate attributeName="opacity" values="0;1;0" dur="1.8s" begin="0s" repeatCount="indefinite"/>
          </circle>
          <circle cx="150" cy="45" r="2" fill="hsl(320,60%,70%)">
            <animate attributeName="opacity" values="0;1;0" dur="2.2s" begin="0.4s" repeatCount="indefinite"/>
          </circle>
          <circle cx="155" cy="155" r="3" fill="hsl(48,75%,75%)">
            <animate attributeName="opacity" values="0;1;0" dur="1.6s" begin="0.8s" repeatCount="indefinite"/>
          </circle>
          <circle cx="45" cy="150" r="2" fill="hsl(350,70%,65%)">
            <animate attributeName="opacity" values="0;1;0" dur="2s" begin="1.2s" repeatCount="indefinite"/>
          </circle>
          <!-- Center glow -->
          <circle cx="100" cy="100" r="12" fill="hsl(48,90%,90%)" opacity="0.8">
            <animate attributeName="r" values="10;16;10" dur="2.5s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2.5s" repeatCount="indefinite"/>
          </circle>
        </svg>

        <!-- Card 2: Blooming flower -->
        <svg
          v-else-if="(index ?? 0) % 4 === 2"
          ref="svgArtRef"
          class="svg-art"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- 6 petals -->
          <g>
            <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="30s" repeatCount="indefinite"/>
            <ellipse cx="100" cy="55" rx="14" ry="32" fill="hsl(320,65%,65%)" opacity="0.8"/>
            <ellipse cx="100" cy="55" rx="14" ry="32" fill="hsl(320,65%,65%)" opacity="0.8" transform="rotate(60 100 100)"/>
            <ellipse cx="100" cy="55" rx="14" ry="32" fill="hsl(340,60%,60%)" opacity="0.8" transform="rotate(120 100 100)"/>
            <ellipse cx="100" cy="55" rx="14" ry="32" fill="hsl(350,65%,55%)" opacity="0.8" transform="rotate(180 100 100)"/>
            <ellipse cx="100" cy="55" rx="14" ry="32" fill="hsl(340,60%,60%)" opacity="0.8" transform="rotate(240 100 100)"/>
            <ellipse cx="100" cy="55" rx="14" ry="32" fill="hsl(320,65%,65%)" opacity="0.8" transform="rotate(300 100 100)"/>
          </g>
          <!-- Stamen -->
          <circle cx="100" cy="100" r="18" fill="hsl(48,80%,70%)">
            <animate attributeName="r" values="16;20;16" dur="3s" repeatCount="indefinite"/>
          </circle>
          <circle cx="100" cy="100" r="10" fill="hsl(48,90%,85%)">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
          </circle>
          <!-- Pollen dots -->
          <circle cx="100" cy="82" r="3" fill="hsl(48,80%,80%)" opacity="0.8"/>
          <circle cx="112" cy="91" r="2.5" fill="hsl(48,80%,80%)" opacity="0.8"/>
          <circle cx="112" cy="109" r="2.5" fill="hsl(48,80%,80%)" opacity="0.8"/>
          <circle cx="100" cy="118" r="3" fill="hsl(48,80%,80%)" opacity="0.8"/>
          <circle cx="88" cy="109" r="2.5" fill="hsl(48,80%,80%)" opacity="0.8"/>
          <circle cx="88" cy="91" r="2.5" fill="hsl(48,80%,80%)" opacity="0.8"/>
        </svg>

        <!-- Card 3: Infinity love knot -->
        <svg
          v-else
          ref="svgArtRef"
          class="svg-art"
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Infinity path drawn with stroke animation -->
          <path
            id="infinity"
            d="M40 100 C40 70, 70 50, 100 100 C130 150, 160 130, 160 100 C160 70, 130 50, 100 100 C70 150, 40 130, 40 100 Z"
            stroke="hsl(350,65%,60%)" stroke-width="4" stroke-linecap="round" fill="none" opacity="0.9">
            <animate attributeName="stroke-dashoffset" from="400" to="0" dur="3s" repeatCount="indefinite"/>
            <animate attributeName="stroke-dasharray" from="0 400" to="400 0" dur="3s" repeatCount="indefinite"/>
          </path>
          <!-- Glow copy -->
          <path
            d="M40 100 C40 70, 70 50, 100 100 C130 150, 160 130, 160 100 C160 70, 130 50, 100 100 C70 150, 40 130, 40 100 Z"
            stroke="hsl(320,55%,65%)" stroke-width="8" stroke-linecap="round" fill="none" opacity="0.2" filter="url(#blur)"/>
          <!-- Moving dot on path -->
          <circle r="6" fill="hsl(48,80%,80%)" opacity="0.9">
            <animateMotion dur="3s" repeatCount="indefinite" rotate="auto">
              <mpath href="#infinity"/>
            </animateMotion>
          </circle>
          <circle r="4" fill="hsl(350,70%,65%)">
            <animateMotion dur="3s" begin="1.5s" repeatCount="indefinite" rotate="auto">
              <mpath href="#infinity"/>
            </animateMotion>
          </circle>
          <!-- Hearts at key points -->
          <path d="M94 55 C90 50, 82 53, 82 62 C82 70, 94 78, 94 78 C94 78, 106 70, 106 62 C106 53, 98 50, 94 55 Z"
            fill="hsl(350,70%,60%)" opacity="0.7">
            <animate attributeName="opacity" values="0.5;0.9;0.5" dur="2s" repeatCount="indefinite"/>
          </path>
          <defs>
            <filter id="blur"><feGaussianBlur stdDeviation="4"/></filter>
          </defs>
        </svg>
      </div>

      <!-- Quote text overlay at bottom -->
      <div class="card-quote">
        <p class="card-quote-text">{{ item.caption }}</p>
      </div>
    </div>

    <!-- Caption hidden — quote is inside card now -->
    <figcaption ref="captionRef" class="gallery-caption" aria-hidden="true">
      {{ item.caption }}
    </figcaption>
  </figure>
</template>

<style scoped>
.gallery-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex-shrink: 0;
}

.gallery-card {
  position: relative;
  overflow: hidden;
  transform-style: preserve-3d;
  background: rgba(10, 8, 20, 0.7);
  backdrop-filter: blur(28px) saturate(1.6);
  -webkit-backdrop-filter: blur(28px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 0 60px hsla(350, 65%, 42%, 0.15),
    0 8px 40px rgba(0,0,0,0.5),
    inset 0 1px 0 rgba(255,255,255,0.05);
  transition: box-shadow 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease;
}

.gallery-card:hover {
  border-color: rgba(255, 255, 255, 0.2);
  box-shadow:
    0 0 100px var(--color-glow-crimson),
    0 20px 60px rgba(0,0,0,0.6),
    inset 0 1px 0 rgba(255,255,255,0.12);
}

/* Animated noise texture */
.card-noise {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
  animation: noise-shift 0.5s steps(2) infinite;
}

@keyframes noise-shift {
  0%   { transform: translate(0, 0); }
  25%  { transform: translate(-2px, 1px); }
  50%  { transform: translate(2px, -1px); }
  75%  { transform: translate(-1px, -2px); }
  100% { transform: translate(1px, 2px); }
}

/* Glow blob behind art */
.card-glow-blob {
  position: absolute;
  inset: 20%;
  z-index: 1;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.25;
  pointer-events: none;
  animation: blob-pulse 4s ease-in-out infinite alternate;
}

@keyframes blob-pulse {
  0%   { transform: scale(0.8); opacity: 0.2; }
  100% { transform: scale(1.2); opacity: 0.35; }
}

/* SVG art container */
.card-art {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.svg-art {
  width: 65%;
  height: 65%;
  filter: drop-shadow(0 0 12px currentColor);
}

/* Quote at bottom */
.card-quote {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 3;
  padding: 2rem 1.25rem 1.25rem;
  background: linear-gradient(to top, rgba(5,3,15,0.85) 0%, transparent 100%);
}

.card-quote-text {
  font-family: var(--font-display);
  font-size: clamp(0.75rem, 1.5vw, 1rem);
  font-style: italic;
  font-weight: 300;
  color: var(--color-ivory);
  opacity: 0.9;
  line-height: 1.4;
  letter-spacing: var(--tracking-tight);
  text-align: center;
}

/* External caption (hidden visually, kept for screen readers) */
.gallery-caption {
  font-family: var(--font-display);
  font-size: var(--text-xs);
  font-style: italic;
  color: var(--color-ivory);
  opacity: 0;
  text-align: center;
  height: 0;
  overflow: hidden;
}

@media (prefers-reduced-motion: reduce) {
  .card-noise { animation: none; }
  .card-glow-blob { animation: none; }
  .svg-art * { animation: none !important; animateTransform: none; }
}
</style>
