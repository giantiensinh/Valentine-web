# Design Document: Valentine Website

## Overview

Valentine Website là một trải nghiệm web cinematic single-page được xây dựng trên Vue 3 (Composition API, `<script setup>`). Mục tiêu kỹ thuật là biến mỗi thao tác scroll thành một hành trình cảm xúc, đạt được thông qua GSAP ScrollTrigger làm scroll engine trung tâm, một hệ thống design token chặt chẽ, và kiến trúc component tách biệt rõ ràng giữa motion logic và presentation.

Tài liệu này bao gồm toàn bộ kiến trúc kỹ thuật: cấu trúc file/folder, component tree, data flow, GSAP scroll engine design, animation system, design token system, và correctness properties.

---

## Architecture

### Technology Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3, Composition API, `<script setup>` |
| Build | Vite 5 + `@tailwindcss/vite` (Tailwind CSS v4) |
| Animation | GSAP 3 + ScrollTrigger plugin |
| Utilities | `@vueuse/core` |
| Icons | `@phosphor-icons/vue` |
| Fonts | Self-hosted via `@font-face` (Cormorant Garamond + Satoshi/Geist) |

### High-Level Architecture

```
App.vue
├── NavBar.vue              (position: fixed, z-index: var(--z-nav))
├── HeroSection.vue         (layout: pinned-scroll-hero)
│   └── ParticleField.vue   (canvas, pointer-events: none)
├── StorySection.vue        (layout: sticky-stack)
│   └── StoryScene.vue      (×3 minimum)
├── GallerySection.vue      (layout: horizontal-scroll-hijack)
│   └── GalleryItem.vue     (img + caption, 3D tilt)
├── BloomEffect.vue         (SVG inline, scroll-triggered once)
├── MessageSection.vue      (layout: editorial-manifesto)
└── ClosingSection.vue      (layout: minimal CTA)
    └── FooterBar.vue       (copyright only)
```


### File and Folder Structure

```
e:\Valentine\
├── index.html
├── vite.config.ts
├── tailwind.config.ts          (empty or minimal — Tailwind v4 config lives in CSS)
├── package.json
├── tsconfig.json
├── public/
│   └── fonts/
│       ├── CormorantGaramond-Regular.woff2
│       ├── CormorantGaramond-Italic.woff2
│       ├── CormorantGaramond-Light.woff2
│       ├── CormorantGaramond-LightItalic.woff2
│       ├── Satoshi-Regular.woff2
│       └── Satoshi-Medium.woff2
└── src/
    ├── main.ts
    ├── App.vue
    ├── styles/
    │   ├── tokens.css              (all CSS custom properties)
    │   ├── fonts.css               (@font-face declarations)
    │   └── base.css                (reset, body defaults)
    ├── components/
    │   ├── NavBar.vue
    │   ├── HeroSection.vue
    │   ├── ParticleField.vue
    │   ├── StorySection.vue
    │   ├── StoryScene.vue
    │   ├── GallerySection.vue
    │   ├── GalleryItem.vue
    │   ├── BloomEffect.vue
    │   ├── MessageSection.vue
    │   └── ClosingSection.vue
    ├── composables/
    │   ├── useScrollEngine.ts      (GSAP context factory)
    │   ├── useReducedMotion.ts     (wraps @vueuse/core usePreferredReducedMotion)
    │   ├── useParticleField.ts     (canvas RAF loop)
    │   └── useTiltEffect.ts       (3D tilt on mouse enter/leave)
    ├── data/
    │   └── content.ts              (story scenes, gallery items, message text)
    └── types/
        └── index.ts                (StoryScene, GalleryItem, etc.)
```

---

## Components and Interfaces

### NavBar.vue

Renders two interactive elements (logo mark + CTA button) on a single row. Position fixed, height ≤ 72px, background transparent while overlapping HeroSection (uses IntersectionObserver via `@vueuse/core` `useIntersectionObserver`).

```typescript
// No props. Internal state:
const isHeroVisible = ref(true) // drives bg opacity
```

### HeroSection.vue

Asymmetric layout: text column ≤ 55vw + asset column. Houses `<ParticleField>`. Delegates scroll pin logic to `useScrollEngine`. Emits no events; scroll engine reads DOM refs directly.

```typescript
// Props: none
// Template refs:
const sectionEl = ref<HTMLElement>()
const headlineEl = ref<HTMLElement>()
const heroImageEl = ref<HTMLImageElement>()
```

### ParticleField.vue

Standalone canvas renderer. Receives no props beyond `reduced` flag. Self-contained RAF loop via `useParticleField` composable.

```typescript
interface Props {
  reduced: boolean  // when true, canvas is not mounted at all
}
```


### StoryScene.vue

Each scene uses `position: sticky; top: 0`. Receives content data as props.

```typescript
interface StorySceneData {
  id: string
  imageSrc: string
  imageAlt: string
  copy: string        // ≤ 25 words
}

interface Props {
  scene: StorySceneData
  index: number
}
```

### GalleryItem.vue

Renders `<img>` + caption text node. Tilt logic lives in `useTiltEffect`.

```typescript
interface GalleryItemData {
  src: string
  alt: string
  caption: string
  aspectRatio: '16/9' | '3/4' | '1/1' | '9/16'
}

interface Props {
  item: GalleryItemData
}
```

### BloomEffect.vue

Inline SVG with ≥ 5 petal `<path>` elements. Receives a trigger signal via a `play` prop. Internal `hasPlayed` ref ensures single-play per session.

```typescript
interface Props {
  play: boolean       // set true by Scroll_Engine once
  reduced: boolean    // if true, skip to final state immediately
}
```

### content.ts — Static Data

```typescript
export const storyScenes: StorySceneData[] = [
  {
    id: 'scene-begin',
    imageSrc: 'https://picsum.photos/seed/valentine-soft-light/900/1200',
    imageAlt: 'Ánh sáng buổi sáng lọc qua rèm mỏng',
    copy: 'Có những buổi sáng, chỉ cần thấy bạn là đủ để ngày dài trở nên nhẹ hơn.',
  },
  {
    id: 'scene-journey',
    imageSrc: 'https://picsum.photos/seed/valentine-hands-together/900/1200',
    imageAlt: 'Hai bàn tay đan vào nhau trên bàn gỗ',
    copy: 'Mỗi bước đi cùng nhau là bản đồ của một nơi gọi là về nhà.',
  },
  {
    id: 'scene-night',
    imageSrc: 'https://picsum.photos/seed/valentine-bokeh-night/900/1200',
    imageAlt: 'Ánh đèn thành phố nhoè trong đêm',
    copy: 'Giữa triệu triệu ánh đèn, tôi chọn ánh sáng trong mắt bạn.',
  },
]

export const galleryItems: GalleryItemData[] = [
  { src: 'https://picsum.photos/seed/valentine-romantic-film/1200/675', alt: 'Buổi chiều phim ảnh', caption: 'Những buổi chiều không tên', aspectRatio: '16/9' },
  { src: 'https://picsum.photos/seed/valentine-soft-light/675/900',    alt: 'Ánh sáng mềm',      caption: 'Ánh sáng của ngày thường', aspectRatio: '3/4' },
  { src: 'https://picsum.photos/seed/valentine-hands-together/800/800', alt: 'Kết nối',           caption: 'Khoảng cách bằng không', aspectRatio: '1/1' },
  { src: 'https://picsum.photos/seed/valentine-bokeh-night/450/800',   alt: 'Đêm bokeh',         caption: 'Đêm của riêng mình', aspectRatio: '9/16' },
]
```

---

## Data Models

### Design Tokens (tokens.css)

```css
/* src/styles/tokens.css */

/* ─── Color ─────────────────────────────── */
:root {
  /* Midnight Base (hue 225, sat 42%, light 8%) */
  --color-midnight-900: hsl(225 42% 8%);
  --color-midnight-800: hsl(225 38% 11%);
  --color-midnight-700: hsl(225 35% 14%);

  /* Ivory Text (hue 48, sat 22%, light 92%) */
  --color-ivory: hsl(48 22% 92%);
  --color-ivory-dim: hsl(48 18% 80%);

  /* Crimson Accent (hue 350, sat 65%, light 42%) */
  --color-crimson: hsl(350 65% 42%);
  --color-crimson-light: hsl(350 65% 55%);
  --color-crimson-dark: hsl(350 65% 30%);

  /* Shadow: mixed crimson hue, 50% opacity */
  --shadow-base: hsla(350 40% 8% / 0.55);
}

/* ─── Typography ─────────────────────────── */
:root {
  --font-display: 'Cormorant Garamond', Georgia, serif;
  --font-body: 'Satoshi', system-ui, sans-serif;

  --text-xs:   0.75rem;   /* 12px */
  --text-sm:   0.875rem;  /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg:   1.125rem;  /* 18px */
  --text-xl:   1.25rem;   /* 20px — body cap */
  --text-2xl:  1.5rem;    /* 24px */
  --text-4xl:  2.25rem;   /* 36px */
  --text-5xl:  3rem;      /* 48px — hero mobile min */
  --text-7xl:  4.5rem;    /* 72px — hero desktop min */
  --text-9xl:  8rem;      /* 128px */

  --leading-tight: 0.95;
  --leading-snug:  1.1;
  --leading-normal: 1.5;

  --tracking-tight: -0.04em;
  --tracking-normal: 0em;
  --tracking-wide: 0.12em;
}

/* ─── Spacing ─────────────────────────────── */
:root {
  --section-pad-x: 8vw;
  --section-pad-x-narrow: 1rem;
  --section-pad-y: 6rem;
  --content-max-w: 1400px;
}

/* ─── Z-index ─────────────────────────────── */
:root {
  --z-particles: 0;
  --z-content:   10;
  --z-nav:       50;
  --z-modal:     100;
}
```


---

## GSAP Scroll Engine Design

### Core Principle

All scroll-driven animation is owned by GSAP ScrollTrigger. There are zero `window.addEventListener('scroll')` calls and zero `scrollY` values in Vue reactive state. Each section component creates its own GSAP context (`gsap.context(...)`) scoped to its root element, so that `ctx.revert()` cleanly removes all tweens and ScrollTriggers on unmount.

### Scroll Engine Architecture

```
useScrollEngine(sectionRef)
  └── gsap.context(() => {
        // all gsap.to / ScrollTrigger.create calls here
      }, sectionRef)

onMounted  → ctx = useScrollEngine(sectionRef)
onUnmounted → ctx.revert()
```

### Section-by-Section Scroll Map

```
┌─────────────────────────────────────────────────────┐
│  HeroSection (pinned-scroll-hero)                   │
│  ScrollTrigger: start="top top" end="+=150%" pin=true│
│  ├─ 0–80%: Particle Field runs, no scene transition │
│  └─ 80%: Bloom_Effect trigger fired (once)          │
├─────────────────────────────────────────────────────┤
│  StorySection (sticky-stack)                        │
│  Each scene: position sticky, top: 0               │
│  Scene N exit: scale 1→0.92, opacity 1→0 (scrub)   │
│  Scene N+1: enters from below naturally             │
├─────────────────────────────────────────────────────┤
│  GallerySection (horizontal-scroll-hijack)          │
│  ScrollTrigger: start="top top" pin=true scrub=1    │
│  Horizontal translate = -(track.scrollWidth - vw)  │
├─────────────────────────────────────────────────────┤
│  BloomEffect (scroll-triggered at 80% Hero pin)     │
│  Single trigger, hasPlayed guard                    │
├─────────────────────────────────────────────────────┤
│  MessageSection (editorial-manifesto)               │
│  IntersectionObserver: 50% threshold → reveal       │
│  Words stagger opacity 0→1, translateY 20→0         │
├─────────────────────────────────────────────────────┤
│  ClosingSection (minimal CTA)                       │
│  No ScrollTrigger; fade in on IntersectionObserver  │
└─────────────────────────────────────────────────────┘
```

### useScrollEngine.ts — Pseudocode

```typescript
// src/composables/useScrollEngine.ts
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
gsap.registerPlugin(ScrollTrigger)

export function useHeroScrollEngine(
  sectionRef: Ref<HTMLElement | undefined>,
  onBloomTrigger: () => void
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    if (!sectionRef.value) return
    ctx = gsap.context(() => {
      // Pin hero for 150% viewport height
      ScrollTrigger.create({
        trigger: sectionRef.value,
        start: 'top top',
        end: '+=150%',
        pin: true,
        onUpdate(self) {
          // Fire bloom at 80% of pinned zone, only once
          if (self.progress >= 0.8) {
            onBloomTrigger()
          }
        },
      })
    }, sectionRef.value)
  })

  onUnmounted(() => ctx?.revert())
}

export function useStoryScrollEngine(
  sectionRef: Ref<HTMLElement | undefined>,
  sceneRefs: Ref<HTMLElement[]>
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      sceneRefs.value.forEach((scene, i) => {
        if (i === sceneRefs.value.length - 1) return
        const nextScene = sceneRefs.value[i + 1]
        gsap.to(scene, {
          scale: 0.92,
          opacity: 0,
          scrollTrigger: {
            trigger: nextScene,
            start: 'top bottom',
            end: 'top top',
            scrub: true,
          },
        })
      })
    }, sectionRef.value)
  })

  onUnmounted(() => ctx?.revert())
}

export function useGalleryScrollEngine(
  sectionRef: Ref<HTMLElement | undefined>,
  trackRef: Ref<HTMLElement | undefined>
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    ctx = gsap.context(() => {
      const track = trackRef.value!
      const distance = track.scrollWidth - window.innerWidth
      gsap.to(track, {
        x: -distance,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.value,
          start: 'top top',
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      })
    }, sectionRef.value)
  })

  onUnmounted(() => ctx?.revert())
}
```

### Reduced Motion Guard

```typescript
// src/composables/useReducedMotion.ts
import { usePreferredReducedMotion } from '@vueuse/core'

export function useReducedMotion() {
  const preference = usePreferredReducedMotion()
  const isReduced = computed(() => preference.value === 'reduce')
  return { isReduced }
}
```

Every section composable checks `isReduced` before registering any ScrollTrigger or GSAP tween. When `isReduced` is true, all sections fall through to normal DOM order, no `position: sticky` or `pin: true` is applied.


---

## Animation System

### Animation Property Constraints

All GSAP tweens exclusively target `transform`-derived properties and `opacity`. No animation may change layout-triggering properties:

| ✅ Allowed | ❌ Forbidden |
|---|---|
| `x`, `y`, `z` | `top`, `left`, `right`, `bottom` |
| `scale`, `scaleX`, `scaleY` | `width`, `height` |
| `rotation`, `rotateX`, `rotateY` | `margin`, `padding` |
| `opacity` | `font-size`, `border-width` |

### Entrance Animation — Hero Headline

```typescript
// Each whitespace-split word wrapped in <span> via Vue template
// gsap.from fires on mount (after fonts loaded)
gsap.from(wordSpans, {
  y: 40,
  opacity: 0,
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  duration: 1.2,
  stagger: 0.08,
})
```

Word-splitting is done in the template with `v-for` over `headline.split(' ')`, each word wrapped in a `<span class="word-token inline-block overflow-hidden">`.

### Story Scene Exit Animation

```
Scene[i] exit tween (scrub: true):
  scale: 1.0 → 0.92
  opacity: 1.0 → 0.0
  ease: none (scrub drives timing)
```

### 3D Tilt Effect — Gallery Items

```typescript
// src/composables/useTiltEffect.ts
export function useTiltEffect(el: Ref<HTMLElement | undefined>) {
  function onMouseMove(e: MouseEvent) {
    const rect = el.value!.getBoundingClientRect()
    const cx = (e.clientX - rect.left) / rect.width  - 0.5  // [-0.5, 0.5]
    const cy = (e.clientY - rect.top)  / rect.height - 0.5  // [-0.5, 0.5]
    // rotateY from cx: multiply by 10 gives max ±5deg
    gsap.to(el.value, {
      rotateY: cx * 10,
      rotateX: -cy * 10,
      transformPerspective: 800,
      ease: 'power1.out',
      duration: 0.1,
      overwrite: true,
    })
  }

  function onMouseLeave() {
    gsap.to(el.value, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.3,
      ease: 'power2.out',
      overwrite: true,
    })
  }

  onMounted(() => {
    el.value?.addEventListener('mousemove', onMouseMove)
    el.value?.addEventListener('mouseleave', onMouseLeave)
  })
  onUnmounted(() => {
    el.value?.removeEventListener('mousemove', onMouseMove)
    el.value?.removeEventListener('mouseleave', onMouseLeave)
  })
}
```

### Bloom Effect Animation

```typescript
// Inside BloomEffect.vue, called when play prop becomes true
function animateBloom(reduced: boolean) {
  if (hasPlayed.value) return
  hasPlayed.value = true

  const paths = Array.from(svgEl.value!.querySelectorAll('.petal-path'))

  if (reduced) {
    // Single frame: set all dashoffset to 0 immediately
    paths.forEach(p => {
      const len = (p as SVGPathElement).getTotalLength()
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: 0 })
    })
    return
  }

  // Set up dasharray = full path length, dashoffset = full length (hidden)
  paths.forEach(p => {
    const len = (p as SVGPathElement).getTotalLength()
    gsap.set(p, { strokeDasharray: len, strokeDashoffset: len })
  })

  // Animate dashoffset to 0 across 1.5s, small stagger inside window
  gsap.to(paths, {
    strokeDashoffset: 0,
    duration: 1.5,
    ease: 'power2.inOut',
    stagger: 0.05,  // max stagger = 0.05 * (5-1) = 0.2s within 1.5s window
  })
}

// Watch play prop
watch(() => props.play, (val) => {
  if (val) animateBloom(props.reduced)
})
```

### Message Section Text Reveal

```typescript
// Uses IntersectionObserver (via @vueuse/core useIntersectionObserver)
// threshold: 0.5 — triggers when 50% of section is visible

useIntersectionObserver(
  messageSectionRef,
  ([entry]) => {
    if (!entry.isIntersecting || hasRevealed.value || isReduced.value) return
    hasRevealed.value = true
    gsap.from(wordTokens.value, {
      opacity: 0,
      y: 20,
      stagger: 0.05,
      duration: 0.6,
      ease: 'power2.out',
    })
  },
  { threshold: 0.5 }
)
// Total duration = stagger * (N-1) + duration
// For 32 words max: 0.05 * 31 + 0.6 = 2.15s → content copy SHALL be ≤ 28 words
// to keep total ≤ 2s: 0.05 * (N-1) + 0.6 ≤ 2s → N ≤ 29 words
```

### CTA Button Fill Animation

The hover fill uses a CSS clip-path technique driven by GSAP to avoid layout-triggering properties:

```css
.cta-button {
  position: relative;
  overflow: hidden;
}
.cta-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-crimson);
  clip-path: inset(0 100% 0 0);  /* starts fully clipped right */
  transition: none;              /* GSAP takes over */
}
```

```typescript
// On mouseenter: determine nearest horizontal edge, animate clip-path
onMouseEnter(e: MouseEvent) {
  const rect = el.getBoundingClientRect()
  const fromLeft = e.clientX - rect.left < rect.width / 2
  gsap.fromTo(pseudo,
    { clipPath: fromLeft ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)' },
    { clipPath: 'inset(0 0% 0 0)', duration: 0.28, ease: 'power2.out' }
  )
}
// On mouseleave: reverse
onMouseLeave() {
  gsap.to(pseudo, { clipPath: 'inset(0 0 0 100%)', duration: 0.2 })
}
```

### Particle Field System

```typescript
// src/composables/useParticleField.ts
interface Particle {
  x: number; y: number
  vx: number; vy: number
  radius: number
  opacity: number  // 0.3–0.7
  hue: number     // 350 (crimson) or 48 (ivory)
}

// 60 particles. RAF loop:
// 1. Clear canvas
// 2. Update positions (wrap at edges)
// 3. Draw each particle as radial gradient
// No DOM reads inside loop → no layout recalculation
```


---

## Diagrams

### Section Layout Families

```
┌──────────────────────────────────┐
│ NavBar (fixed, z-nav)            │ height ≤ 72px
├──────────────────────────────────┤
│                                  │
│  HeroSection                     │ pinned-scroll-hero
│  ┌───────────────┬───────────┐   │ min-height: 100dvh
│  │  text ≤55vw   │  image    │   │ pin duration: +150%
│  │  left-aligned │  asset    │   │
│  └───────────────┴───────────┘   │
│  [canvas: ParticleField]         │
│                                  │
├──────────────────────────────────┤
│  BloomEffect (SVG, centered)     │ fired at 80% hero scroll
├──────────────────────────────────┤
│                                  │
│  StorySection                    │ sticky-stack
│  ┌──────────────────────────┐    │
│  │ Scene 1 (sticky, z:1)    │    │
│  │ Scene 2 (sticky, z:2)    │    │
│  │ Scene 3 (sticky, z:3)    │    │
│  └──────────────────────────┘    │
│                                  │
├──────────────────────────────────┤
│                                  │
│  GallerySection                  │ horizontal-scroll-hijack
│  ┌────────────────────────────┐  │ pin: true, scrub: 1
│  │ ← [img][img][img][img] →  │  │ overflow: hidden
│  └────────────────────────────┘  │
│                                  │
├──────────────────────────────────┤
│                                  │
│  MessageSection                  │ editorial-manifesto
│  typography-only, 100dvh         │ IntersectionObserver reveal
│  Midnight + radial Crimson bg    │
│                                  │
├──────────────────────────────────┤
│                                  │
│  ClosingSection                  │ minimal CTA
│  1 text node + 1 CTA button      │ min-height: 100vh
│                                  │
├──────────────────────────────────┤
│  FooterBar (copyright only)      │
└──────────────────────────────────┘
```

### Animation State Machine — BloomEffect

```
[created] ──────────────────────────────────────────────────►
                                                    hasPlayed = false
            props.play becomes true
                    │
                    ▼
          hasPlayed? ──yes──► [no-op, stays drawn]
                    │
                   no
                    │
                    ▼
          isReduced?
           │         │
          yes        no
           │          │
           ▼          ▼
     gsap.set()    gsap.set() setup dasharray
    dashoffset=0   dashoffset = pathLength
                      │
                      ▼
                  gsap.to() animate
                  dashoffset → 0
                  duration: 1.5s
                  ease: power2.inOut
                      │
                      ▼
                 [fully drawn, stays drawn]
```

### Data Flow Diagram

```
App.vue
  │
  ├─► { isReduced }  ◄── useReducedMotion()
  │       │
  │       ├─► HeroSection (isReduced)
  │       │       │
  │       │       ├─► ParticleField (reduced)
  │       │       └─► useHeroScrollEngine → emits onBloomTrigger
  │       │                                       │
  │       │                               ┌───────▼────────┐
  │       │                               │  bloomPlaying   │  (ref in App.vue)
  │       │                               └───────┬────────┘
  │       │                                       │
  │       ├─► BloomEffect (play=bloomPlaying, reduced)
  │       │
  │       ├─► StorySection (isReduced)
  │       │       └─► StoryScene × N (content from data/content.ts)
  │       │
  │       ├─► GallerySection (isReduced)
  │       │       └─► GalleryItem × 4 (content from data/content.ts)
  │       │
  │       ├─► MessageSection (isReduced)
  │       └─► ClosingSection
```


---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

**Property Reflection:** After completing prework, the following redundancies were identified and resolved:
- "Section uses Midnight_Base background" and "Section lightness ≤ 25%" are the same invariant, consolidated into Property 2.
- Hero headline word animation and Message Section word animation both test the same "word token initial state" pattern but at different timings and values; kept separate as they validate different acceptance criteria.
- "Bloom plays once" and "Bloom is idempotent" are the same property; consolidated into Property 8.

---

### Property 1: All heading elements use Typography_Display font family

*For any* `h1` or `h2` element rendered by any section component, its computed `font-family` value must resolve to Cormorant Garamond or Canela (the configured `--font-display` CSS custom property).

**Validates: Requirements 3.1**

---

### Property 2: All section backgrounds use Midnight_Base with lightness ≤ 25%

*For any* section component in the page, its background color must use the `--color-midnight-*` token family, with HSL lightness value ≤ 25%; no section may use a background color in the light-mode range.

**Validates: Requirements 2.2, 2.4**

---

### Property 3: Hero headline word tokens have correct GSAP initial state

*For any* whitespace-split word token in the Hero_Section headline, when entrance animation fires, the GSAP `from` state must be `{ y: 40, opacity: 0 }` with `ease: 'cubic-bezier(0.16, 1, 0.3, 1)'`, `duration: 1.2`, `stagger: 0.08`. Every word token must be in this initial state before animation starts.

**Validates: Requirements 4.6**

---

### Property 4: Bloom fires at scroll progress ≥ 0.8 and not before

*For any* scroll progress value in the Hero pin zone, `onBloomTrigger` must have been called exactly when and only when progress ≥ 0.8; for any scroll progress < 0.8, bloom must not have been triggered.

**Validates: Requirements 5.3**

---

### Property 5: Story scene exit tweens target scale 0.92 and opacity 0

*For any* scene at index `i` (not the last scene) in Story_Section, the GSAP tween created for its exit must have `{ scale: 0.92, opacity: 0 }` as targets and `scrub: true`.

**Validates: Requirements 5.4**

---

### Property 6: Gallery image tilt stays within ±5 degrees

*For any* cursor position `(x, y)` within the bounds of a GalleryItem image element, the computed `rotateX` and `rotateY` values applied by `useTiltEffect` must satisfy `|rotateX| ≤ 5` and `|rotateY| ≤ 5` degrees.

**Validates: Requirements 6.4**

---

### Property 7: Message section total word reveal duration ≤ 2 seconds

*For any* message headline with `N` whitespace-split words, the total animation duration from first word to last word — computed as `stagger * (N - 1) + per_word_duration` — must be ≤ 2.0 seconds. (With stagger=0.05 and duration=0.6, N must be ≤ 29 words.)

**Validates: Requirements 7.3**

---

### Property 8: Bloom animation is idempotent — plays exactly once per session

*For any* number of calls to `animateBloom()` or re-entries into the scroll trigger zone after the first play, the Bloom animation state must remain `hasPlayed = true` with all petal `stroke-dashoffset` values at 0; no re-animation occurs. The function is idempotent: `animateBloom()` called N ≥ 1 times produces the same final state as calling it once.

**Validates: Requirements 8.9, 8.8**

---

### Property 9: All GSAP tween targets use only transform or opacity properties

*For any* GSAP tween object created anywhere in the codebase, its target properties must belong exclusively to the set: `{ x, y, z, scale, scaleX, scaleY, rotation, rotateX, rotateY, transformPerspective, opacity, strokeDashoffset, strokeDasharray, clipPath }`. No tween may target `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, `padding`, or any other layout property.

**Validates: Requirements 10.4**

---

### Property 10: All consecutive section pairs use different layout families

*For any* consecutive pair of sections `(S_i, S_{i+1})` in the page, `S_i.layoutFamily ≠ S_{i+1}.layoutFamily`. The four layout families are: `pinned-scroll-hero`, `sticky-stack`, `horizontal-scroll-hijack`, `editorial-manifesto`.

**Validates: Requirements 9.3**

---

### Property 11: Ivory-on-Midnight contrast ratio meets accessibility minimums

*For any* text element using `--color-ivory` on a `--color-midnight-*` background, the computed WCAG contrast ratio must be ≥ 4.5:1 for body text (font-size < 18px) and ≥ 3:1 for large text (font-size ≥ 18px normal weight). Crimson accent on Midnight must achieve ≥ 3:1 for large text.

**Validates: Requirements 10.7**

---

### Property 12: All informational images have non-empty alt attributes

*For any* `<img>` element rendered in the page that carries visual information (hero image, story scene images, gallery images), its `alt` attribute must be a non-empty string describing the image content. Purely decorative images must have `alt=""` and `aria-hidden="true"`.

**Validates: Requirements 10.8**

---

## Error Handling

### Font Load Failure

Fonts are loaded with `font-display: swap`. If the display font (Cormorant Garamond) fails to load, the browser falls back to `Georgia, serif` — still a serif font that preserves the editorial aesthetic. Body text falls back to `system-ui, sans-serif`. The layout does not shift because `font-display: swap` prevents FOIT.

### Image Load Failure

All `<img>` elements include explicit `width` and `height` attributes (or `aspect-ratio` CSS) so the surrounding container maintains correct height even before the image loads. `alt` text is always descriptive. No `<div>` replacements are used.

### GSAP / ScrollTrigger Load Failure

GSAP is a bundled dependency (not CDN), so load failure only occurs if the entire JS bundle fails. In that case, all content remains visible in its natural DOM order — no content is hidden exclusively via JS-applied opacity. CSS initial states ensure content is readable without JS.

### Reduced Motion — Full Disable

`useReducedMotion()` is checked at the top of `App.vue`. When `isReduced` is true:
- `<ParticleField>` is not mounted (`v-if="!isReduced"`)
- All `useScrollEngine` composables skip registering ScrollTrigger instances
- GSAP `gsap.from()` / `gsap.to()` calls are guarded by `if (isReduced.value) return`
- `BloomEffect` sets `stroke-dashoffset: 0` immediately via `gsap.set()` (one frame, no animation)
- Message section words are visible at `opacity: 1, translateY: 0` immediately

### Canvas Error

If `<canvas>` 2D context is unavailable, `useParticleField` catches `getContext('2d')` returning null and exits early. The hero section renders normally without the particle field.

---

## Testing Strategy

### Dual Testing Approach

This feature uses both **property-based tests** (for universal invariants) and **unit/integration tests** (for specific examples and infrastructure wiring). Both are necessary for comprehensive coverage.

### Property-Based Testing Library

**Recommended: [fast-check](https://github.com/dubzzz/fast-check)** (TypeScript-native, excellent Vue/Vite integration, actively maintained).

```bash
npm install --save-dev fast-check vitest @vitest/ui
```

Each correctness property is implemented as a single `test()` using `fc.assert(fc.property(...))` with a minimum of **100 runs** per property.

### Tag Format

Each property test must include this comment tag:

```typescript
// Feature: valentine-website, Property N: <property_text>
```

### Property Tests (Vitest + fast-check)

| Property | Test Description | Generators |
|---|---|---|
| 1 | Heading font-family resolves to display font | `fc.constantFrom('h1', 'h2')` across all sections |
| 2 | Section backgrounds use Midnight tokens, lightness ≤ 25% | `fc.constantFrom(sections)` |
| 3 | Hero word tokens have correct GSAP from-state | `fc.string({minLength:1})` split into words |
| 4 | Bloom fires iff scroll progress ≥ 0.8 | `fc.float({min:0, max:1})` scroll progress values |
| 5 | Story exit tweens have scale:0.92, opacity:0 | `fc.integer({min:0, max:N-2})` scene indices |
| 6 | Gallery tilt stays within ±5 degrees | `fc.tuple(fc.float(), fc.float())` cursor positions |
| 7 | Message reveal duration ≤ 2s for any word count ≤ 29 | `fc.integer({min:1, max:29})` word counts |
| 8 | Bloom play is idempotent | `fc.integer({min:1, max:50})` call counts |
| 9 | GSAP tween targets only transform/opacity | Analyze all tween definitions in composables |
| 10 | Consecutive sections have different layout families | Ordered section layout family array |
| 11 | Ivory/Midnight contrast ratio passes WCAG | Token HSL values → contrast calculation |
| 12 | All informational imgs have non-empty alt | `fc.string({minLength:1})` image content data |

### Unit / Example Tests

- `tokens.css` parsing: verify all 4 token groups exist (color, typography, spacing, z-index)
- Specific accent color HSL values are within spec (hue 345–360, sat 55–75%, light 35–50%)
- Gallery ScrollTrigger config: `pin: true`, `scrub: 1`, correct start/end values
- Hero ScrollTrigger config: `end: '+=150%'`, `pin: true`
- `useReducedMotion` returns `true` when media query matches

### Integration Tests

- Bloom trigger: `play` prop `false → true` → SVG petal paths reach `stroke-dashoffset: 0`
- Particle Field: canvas renders without triggering layout recalculations on surrounding DOM
- Navigation: two interactive elements rendered on one row at viewport ≥ 768px
- CTA hover fill animation completes within 300ms

### Accessibility Tests

- Contrast ratio computation for `--color-ivory` on `--color-midnight-900`: expected ≥ 4.5:1
- All `<img>` elements in rendered output have `alt` attributes

### Performance Notes

- LCP target: hero `<img>` must have `width`, `height`, `fetchpriority="high"`, and `loading="eager"`
- No `will-change` set outside active animations (verified via composable lifecycle)
- Particle Field RAF loop does not read from DOM in animation frame

