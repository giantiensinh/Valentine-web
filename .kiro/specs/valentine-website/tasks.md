# Implementation Plan: Valentine Website

## Overview

Xây dựng Valentine Website theo từng lớp từ nền tảng dự án đến các section phức tạp. Mỗi task xây dựng trên task trước, kết thúc bằng wire-up toàn bộ hệ thống. Animation engine (GSAP ScrollTrigger) được thiết lập sớm để các section sau có thể tích hợp ngay.

## Tasks

- [x] 1. Khởi tạo dự án và cấu hình nền tảng
  - Khởi tạo Vite + Vue 3 TypeScript project tại `e:\Valentine\`
  - Cài đặt dependencies: `gsap`, `@vueuse/core`, `@phosphor-icons/vue`, `@tailwindcss/vite`, vitest, fast-check
  - Cấu hình `vite.config.ts` với `@tailwindcss/vite` plugin (không dùng postcss approach)
  - Tạo `tsconfig.json` và `package.json` với scripts: dev, build, test
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Thiết lập design token system và typography
  - [x] 2.1 Tạo `src/styles/tokens.css` với 4 nhóm CSS custom properties bắt buộc
    - Color tokens: `--color-midnight-*`, `--color-ivory`, `--color-ivory-dim`, `--color-crimson-*`, `--shadow-base`
    - Typography tokens: `--font-display`, `--font-body`, `--text-*` scale, `--leading-*`, `--tracking-*`
    - Spacing tokens: `--section-pad-x`, `--section-pad-x-narrow`, `--section-pad-y`, `--content-max-w`
    - Z-index tokens: `--z-particles: 0`, `--z-content: 10`, `--z-nav: 50`, `--z-modal: 100`
    - _Requirements: 1.5, 2.1, 2.2, 2.3, 10.5_
  - [x] 2.2 Tạo `src/styles/fonts.css` với `@font-face` cho Cormorant Garamond và Satoshi
    - Đặt font files vào `public/fonts/` (CormorantGaramond-Regular/Italic/Light/LightItalic + Satoshi-Regular/Medium)
    - Set `font-display: swap` trên tất cả `@font-face` declarations
    - _Requirements: 1.4, 3.1, 3.2_
  - [x] 2.3 Tạo `src/styles/base.css` với reset, body defaults sử dụng tokens
    - Body: background `--color-midnight-900`, color `--color-ivory`, font `--font-body`
    - `border-radius: 0` global, box-shadow dùng `--shadow-base`
    - _Requirements: 2.2, 2.6_
  - [x]* 2.4 Viết unit tests cho token system
    - Verify 4 token groups tồn tại trong tokens.css
    - Verify Crimson_Accent HSL values nằm trong spec (hue 345-360, sat 55-75%, light 35-50%)
    - Verify Midnight_Base lightness 5-12%, Ivory_Text lightness 88-95%
    - _Requirements: 2.1, 2.2, 2.3_

- [x] 3. Tạo types, data layer và composables cốt lõi
  - [x] 3.1 Tạo `src/types/index.ts` với interfaces TypeScript
    - `StorySceneData`, `GalleryItemData` interfaces theo design spec
    - _Requirements: 5.5, 6.2_
  - [x] 3.2 Tạo `src/data/content.ts` với static data
    - `storyScenes` array (3 scenes, mỗi scene ảnh Picsum seed riêng, copy tối đa 25 từ, không duplicate ảnh)
    - `galleryItems` array (4 items, aspect ratios xen kẽ: 16/9, 3/4, 1/1, 9/16)
    - `messageHeadline` string (tối đa 29 words để thỏa mãn Property 7)
    - _Requirements: 5.5, 6.2, 6.3, 7.1_
  - [x] 3.3 Tạo `src/composables/useReducedMotion.ts`
    - Wrap `usePreferredReducedMotion` từ `@vueuse/core`
    - Export `{ isReduced: ComputedRef<boolean> }`
    - _Requirements: 4.9, 5.8, 6.8, 7.7, 8.6, 10.9_
  - [x]* 3.4 Viết unit test cho `useReducedMotion`
    - Verify trả về `true` khi media query `prefers-reduced-motion: reduce` match
    - _Requirements: 10.9_

- [x] 4. Tạo GSAP scroll engine composables
  - [x] 4.1 Tạo `src/composables/useScrollEngine.ts` với 3 exported functions
    - `useHeroScrollEngine(sectionRef, onBloomTrigger)`: pin hero end=`+=150%`, fire bloom at progress >= 0.8
    - `useStoryScrollEngine(sectionRef, sceneRefs)`: exit tween scale 1→0.92, opacity 1→0 scrub=true
    - `useGalleryScrollEngine(sectionRef, trackRef)`: horizontal translate, pin=true, scrub=1, invalidateOnRefresh=true
    - Tất cả functions: check `isReduced` trước khi đăng ký ScrollTrigger; gọi `ctx.revert()` trong onUnmounted
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.6, 5.7, 5.8_
  - [x]* 4.2 Viết property test: Property 4 - Bloom fires iff scroll progress >= 0.8
    - **Property 4: Bloom fires at scroll progress ≥ 0.8 and not before**
    - **Validates: Requirements 5.3**
    - Dùng `fc.float({min:0, max:1})` để generate progress values
    - _Requirements: 5.3_
  - [ ]* 4.3 Viết property test: Property 5 - Story exit tweens đúng target values
    - **Property 5: Story scene exit tweens target scale 0.92 and opacity 0**
    - **Validates: Requirements 5.4**
    - Dùng `fc.integer({min:0})` cho scene indices
    - _Requirements: 5.4_
  - [ ]* 4.4 Viết property test: Property 9 - GSAP tweens chỉ dùng transform/opacity
    - **Property 9: All GSAP tween targets use only transform or opacity properties**
    - **Validates: Requirements 10.4**
    - Phân tích tất cả tween definitions trong composables
    - _Requirements: 10.4_

- [x] 5. Implement `src/main.ts` và `src/App.vue`
  - Tạo `src/main.ts`: mount App, import CSS (tokens, fonts, base)
  - Tạo `src/App.vue`: import `useReducedMotion`, quản lý `bloomPlaying` ref, compose tất cả section components theo đúng thứ tự DOM
  - Pass `isReduced` và `bloomPlaying` xuống các child components theo Data Flow Diagram
  - _Requirements: 4.9, 5.8, 9.3_

- [x] 6. Implement ParticleField composable và component
  - [x] 6.1 Tạo `src/composables/useParticleField.ts`
    - 60 particles, RAF loop: clear → update positions (wrap at edges) → draw radial gradient
    - Particle opacity 0.3-0.7, hue crimson (350) hoặc ivory (48)
    - Không đọc DOM trong RAF loop
    - _Requirements: 4.5, 10.3_
  - [x] 6.2 Tạo `src/components/ParticleField.vue`
    - Props: `reduced: boolean`; nếu `reduced === true`, không mount canvas (`v-if`)
    - Canvas: `pointer-events: none`, `z-index: var(--z-particles)`
    - _Requirements: 4.5, 4.9, 10.3_

- [x] 7. Implement NavBar.vue
  - Tạo `src/components/NavBar.vue`
  - Position fixed, height ≤ 72px, `z-index: var(--z-nav)`
  - Hai interactive elements: logo mark (trái) + CTA button (phải) trên một dòng duy nhất
  - `useIntersectionObserver` (`@vueuse/core`) để track hero visibility → điều chỉnh background opacity < 0.9 khi overlap Hero
  - _Requirements: 9.1, 9.2_

- [x] 8. Implement HeroSection và entrance animation
  - [x] 8.1 Tạo `src/components/HeroSection.vue`
    - min-height: 100dvh, asymmetric layout (text ≤ 55vw, asset column phần còn lại)
    - 4 text elements: eyebrow uppercase + display headline (≤ 2 dòng) + subtext (≤ 20 từ) + CTA button
    - Không có taglines, scroll indicators, trust badges, version labels
    - Hero image với explicit `width`/`height` attributes và `fetchpriority="high"`, `loading="eager"`
    - Top padding ≤ 6rem trên desktop; CTA visible trên viewport 320×568 không cần scroll
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.7, 4.8, 10.1, 10.6_
  - [x] 8.2 Implement entrance animation và scroll engine integration
    - Word-split headline bằng `v-for` over `headline.split(' ')`, mỗi word trong `<span class="word-token inline-block overflow-hidden">`
    - GSAP entrance: `gsap.from(wordSpans, {y:40, opacity:0, ease:'cubic-bezier(0.16,1,0.3,1)', duration:1.2, stagger:0.08})`
    - Guard bằng `isReduced`; khi reduced = static state
    - Gọi `useHeroScrollEngine` và fire `bloomPlaying` khi callback
    - _Requirements: 4.6, 4.9, 5.2, 5.3_
  - [ ]* 8.3 Viết property test: Property 3 - Hero word tokens có đúng GSAP from-state
    - **Property 3: Hero headline word tokens have correct GSAP initial state**
    - **Validates: Requirements 4.6**
    - Dùng `fc.string({minLength:1})` split thành words
    - _Requirements: 4.6_

- [x] 9. Checkpoint - Kiểm tra foundation
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement BloomEffect.vue
  - [x] 10.1 Tạo `src/components/BloomEffect.vue`
    - SVG inline với ≥ 5 petal `<path>` elements với class `petal-path`
    - Stroke color: Crimson_Accent (hue 345-360), chỉ stroke không fill
    - Props: `play: boolean`, `reduced: boolean`
    - `hasPlayed` ref để guard idempotency
    - _Requirements: 8.1, 8.2, 8.7_
  - [x] 10.2 Implement Bloom animation logic
    - Khi `play` prop → true và `hasPlayed === false`: set `strokeDasharray/strokeDashoffset` = path length, animate dashoffset → 0
    - duration 1.5s, ease `power2.inOut`, stagger ≤ 0.05s × (N-1) trong cùng 1.5s window
    - Khi `reduced`: `gsap.set()` dashoffset = 0 ngay lập tức (1 frame)
    - Sau animate: petal paths giữ `stroke-dashoffset: 0` không reset, không loop
    - Dùng GSAP (không dùng CSS animation/transition trên petal paths)
    - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.8, 8.9_
  - [ ]* 10.3 Viết property test: Property 8 - Bloom idempotent, plays exactly once
    - **Property 8: Bloom animation is idempotent — plays exactly once per session**
    - **Validates: Requirements 8.9, 8.8**
    - Dùng `fc.integer({min:1, max:50})` cho số lần gọi
    - _Requirements: 8.8, 8.9_

- [x] 11. Implement StorySection và StoryScene
  - [x] 11.1 Tạo `src/components/StoryScene.vue`
    - Props: `scene: StorySceneData`, `index: number`
    - `position: sticky; top: 0`; visual asset + copy (≤ 25 words); ảnh với alt attribute mô tả
    - _Requirements: 5.4, 5.5, 10.8_
  - [x] 11.2 Tạo `src/components/StorySection.vue`
    - Render `<StoryScene>` × 3 (từ `content.ts`)
    - Gọi `useStoryScrollEngine`; guard với `isReduced`
    - _Requirements: 5.4, 5.5, 5.8_
  - [ ]* 11.3 Viết property test: Property 10 - Consecutive sections dùng khác layout family
    - **Property 10: All consecutive section pairs use different layout families**
    - **Validates: Requirements 9.3**
    - Dùng ordered section layout family array
    - _Requirements: 9.3_

- [x] 12. Implement `useTiltEffect` và GalleryItem/GallerySection
  - [x] 12.1 Tạo `src/composables/useTiltEffect.ts`
    - mousemove: `rotateY = cx * 10`, `rotateX = -cy * 10` (max ±5 degrees)
    - mouseleave: animate trở về 0,0 trong 0.3s ease `power2.out`
    - Dùng GSAP, cleanup event listeners trong onUnmounted
    - _Requirements: 6.4, 6.5_
  - [x] 12.2 Tạo `src/components/GalleryItem.vue`
    - Props: `item: GalleryItemData`
    - `<img>` với alt, aspect-ratio, width/height attributes; caption bên ngoài img (không overlay)
    - Caption: Typography_Body, font-size ≤ 0.875rem, Ivory_Text opacity 0.6
    - Tích hợp `useTiltEffect`; không có text absolute/fixed overlay trên img
    - _Requirements: 6.3, 6.6, 6.7, 10.6, 10.8_
  - [x] 12.3 Tạo `src/components/GallerySection.vue`
    - Wrapper: overflow hidden; inner track translate ngang khi scroll
    - 4 items từ `content.ts` (aspect ratios xen kẽ, không duplicate ảnh liên tiếp)
    - Gọi `useGalleryScrollEngine`; guard với `isReduced` (disable tilt + hijack khi reduced)
    - _Requirements: 6.1, 6.2, 6.8, 5.6_
  - [ ]* 12.4 Viết property test: Property 6 - Gallery tilt stays within ±5 degrees
    - **Property 6: Gallery image tilt stays within ±5 degrees**
    - **Validates: Requirements 6.4**
    - Dùng `fc.tuple(fc.float({min:0,max:1}), fc.float({min:0,max:1}))` cho normalized cursor positions
    - _Requirements: 6.4_

- [x] 13. Implement MessageSection.vue
  - [x] 13.1 Tạo `src/components/MessageSection.vue`
    - min-height: 100dvh; Typography_Display headline ≥ 3rem mobile / 5rem desktop; italic trên 1-3 key words
    - Nền Midnight_Base + radial-gradient Crimson_Accent center (radius ≤ 40vw, opacity ≤ 15%)
    - Không có img, video, icon bên cạnh hoặc overlay lên headline
    - Subtext: Typography_Body, opacity 0.7, ≤ 80 ký tự, không có em-dash
    - _Requirements: 7.1, 7.2, 7.4, 7.5, 7.6_
  - [x] 13.2 Implement word reveal animation
    - Word-split message bằng `v-for` over `messageHeadline.split(' ')`
    - `useIntersectionObserver` threshold 0.5: khi intersecting và không reduced → `gsap.from(wordTokens, {opacity:0, y:20, stagger:0.05, duration:0.6, ease:'power2.out'})`
    - Guard `hasRevealed` ref để chỉ reveal một lần
    - Khi reduced: tất cả words opacity 1, translateY 0 ngay lập tức
    - _Requirements: 7.3, 7.7_
  - [ ]* 13.3 Viết property test: Property 7 - Message reveal duration ≤ 2s
    - **Property 7: Message section total word reveal duration ≤ 2 seconds**
    - **Validates: Requirements 7.3**
    - Dùng `fc.integer({min:1, max:29})` cho word counts
    - _Requirements: 7.3_

- [x] 14. Implement ClosingSection.vue và FooterBar
  - Tạo `src/components/ClosingSection.vue`
    - min-height: 100vh; đúng 2 visible elements: text node (≤ 10 từ, font-size ≤ 14px) + CTA button (≤ 3 words label)
    - CTA button không có max-width constraint nhỏ hơn label + 48px padding
    - Không có image, icon decorative, additional text blocks
    - Không có scroll cue indicators, version labels, decorative strips
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.6_
  - Tạo CTA hover fill animation với GSAP + CSS clip-path technique (không thay đổi layout properties)
    - mouseenter: detect nearest horizontal edge → animate `clip-path: inset(0 100%/0 0 0) → inset(0 0% 0 0)`, duration ≤ 0.28s, Crimson_Accent fill
    - mouseleave: reverse clip-path trong 0.2s
    - _Requirements: 11.5_
  - Tạo `FooterBar` (có thể inline trong ClosingSection): chỉ một copyright text node
    - _Requirements: 11.7_

- [x] 15. Checkpoint - Integration test tất cả sections
  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Wire-up `App.vue` và kiểm tra data flow đầy đủ
  - [x] 16.1 Hoàn thiện `App.vue` - kết nối tất cả components
    - Import và render theo thứ tự: NavBar → HeroSection → BloomEffect → StorySection → GallerySection → MessageSection → ClosingSection
    - Truyền `bloomPlaying` ref từ `onBloomTrigger` callback xuống `<BloomEffect :play="bloomPlaying">`
    - Truyền `isReduced` xuống tất cả components cần
    - Verify không có 2 section liên tiếp nào dùng cùng layout family
    - _Requirements: 9.3, 9.4, 9.5, 9.6_
  - [x] 16.2 Implement responsive layout (mobile collapse)
    - Tất cả multi-column asymmetric layouts collapse về single-column trên viewport < 768px
    - Inline padding: 1rem mỗi bên trên mobile
    - Nav elements đều trên một dòng ≥ 768px
    - _Requirements: 9.2, 9.7_
  - [ ]* 16.3 Viết property test: Property 1 - Heading font-family resolves to display font
    - **Property 1: All heading elements use Typography_Display font family**
    - **Validates: Requirements 3.1**
    - Dùng `fc.constantFrom('h1', 'h2')` across all sections
    - _Requirements: 3.1_
  - [ ]* 16.4 Viết property test: Property 2 - Section backgrounds dùng Midnight tokens, lightness ≤ 25%
    - **Property 2: All section backgrounds use Midnight_Base with lightness ≤ 25%**
    - **Validates: Requirements 2.2, 2.4**
    - Dùng `fc.constantFrom(sections)` để verify mọi section
    - _Requirements: 2.2, 2.4_
  - [ ]* 16.5 Viết property test: Property 10 (integration) - Layout families
    - **Property 10: All consecutive section pairs use different layout families**
    - **Validates: Requirements 9.3**
    - Verify ordered section array trong App.vue
    - _Requirements: 9.3_

- [x] 17. Accessibility và performance hardening
  - [x] 17.1 Kiểm tra và fix contrast ratio, alt attributes
    - Verify contrast ratio Ivory_Text trên Midnight_Base ≥ 4.5:1 (body) / ≥ 3:1 (large text)
    - Verify Crimson_Accent trên Midnight_Base ≥ 3:1 cho large text
    - Verify tất cả informational `<img>` có non-empty `alt`; decorative imgs có `alt=""` và `aria-hidden="true"`
    - _Requirements: 10.7, 10.8_
  - [ ]* 17.2 Viết property test: Property 11 - Ivory/Midnight contrast ratio passes WCAG
    - **Property 11: Ivory-on-Midnight contrast ratio meets accessibility minimums**
    - **Validates: Requirements 10.7**
    - Dùng token HSL values để compute contrast ratio
    - _Requirements: 10.7_
  - [ ]* 17.3 Viết property test: Property 12 - All informational imgs có non-empty alt
    - **Property 12: All informational images have non-empty alt attributes**
    - **Validates: Requirements 10.8**
    - Dùng `fc.string({minLength:1})` cho image content data
    - _Requirements: 10.8_
  - [x] 17.4 Performance: LCP optimization và will-change audit
    - Hero `<img>`: thêm `fetchpriority="high"`, `loading="eager"`, explicit `width`/`height`
    - Audit và remove `will-change` ngoài active animation lifecycle
    - Verify `border-radius: 0` toàn trang
    - Verify bóng đổ dùng `--shadow-base` (pha hue Crimson) không dùng `rgba(0,0,0,x)` thuần
    - _Requirements: 10.1, 10.2, 2.5, 2.6_

- [ ] 18. Final checkpoint - Đảm bảo toàn bộ spec đã implemented
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks đánh dấu `*` là optional và có thể skip để ra MVP nhanh hơn
- Mỗi task tham chiếu requirements cụ thể để traceability
- Checkpoints đảm bảo validation incremental
- Property tests validate universal correctness properties (fast-check, minimum 100 runs/property)
- Unit tests validate specific examples và edge cases
- Design sử dụng TypeScript + Vue 3 `<script setup>` - tất cả code examples theo tech stack này
- Tag format cho property tests: `// Feature: valentine-website, Property N: <property_text>`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["2.1", "2.2", "2.3", "3.1"] },
    { "id": 1, "tasks": ["2.4", "3.2", "3.3"] },
    { "id": 2, "tasks": ["3.4", "4.1"] },
    { "id": 3, "tasks": ["4.2", "4.3", "4.4", "6.1"] },
    { "id": 4, "tasks": ["6.2", "8.1"] },
    { "id": 5, "tasks": ["8.2", "10.1", "11.1", "12.1"] },
    { "id": 6, "tasks": ["8.3", "10.2", "11.2", "12.2"] },
    { "id": 7, "tasks": ["10.3", "11.3", "12.3", "13.1"] },
    { "id": 8, "tasks": ["12.4", "13.2"] },
    { "id": 9, "tasks": ["13.3", "16.1"] },
    { "id": 10, "tasks": ["16.2", "16.3", "16.4", "16.5", "17.1"] },
    { "id": 11, "tasks": ["17.2", "17.3", "17.4"] }
  ]
}
```
