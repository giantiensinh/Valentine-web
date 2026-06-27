# Requirements Document

## Introduction

Website Valentine là một trải nghiệm web cinematic, một trang, được xây dựng bằng Vue 3 (Composition API, `<script setup>`). Website không phải là thiệp mừng thông thường mà là **một bức thư tình bằng hình ảnh và chuyển động** - mỗi section kể một đoạn câu chuyện, mỗi animation có lý do tồn tại, mỗi pixel phục vụ cảm xúc.

Nguyên tắc thiết kế từ taste-skill được áp dụng với dial settings:
- `DESIGN_VARIANCE: 9` - Layout bất đối xứng, Awwwards-experimental
- `MOTION_INTENSITY: 9` - Cinematic scroll, physics-based animation, GSAP ScrollTrigger
- `VISUAL_DENSITY: 3` - Airy, luxury, premium consumer

Design Read: "Website Valentine dành cho người yêu, với ngôn ngữ cinematic-editorial premium, thiên về GSAP scroll-storytelling + asymmetric grid + kinetic typography."

Palette: **Deep Midnight + Ivory + Crimson Bloom** - tránh tuyệt đối beige+brass+espresso AI-default, dùng deep navy/midnight blue làm nền chính, ivory/off-white cho text, đỏ thắm bão hòa thấp làm accent duy nhất.

---

## Glossary

- **Valentine_Website**: Toàn bộ ứng dụng Vue 3 single-page
- **Hero_Section**: Section đầu tiên, pinned khi scroll, là điểm mở màn câu chuyện
- **Story_Section**: Các section kể câu chuyện tình yêu theo trục thời gian
- **Gallery_Section**: Section hình ảnh cinematic full-bleed
- **Message_Section**: Section thông điệp trung tâm cảm xúc nhất
- **Bloom_Effect**: Hiệu ứng hoa nở - animation ký danh của website
- **Scroll_Engine**: Hệ thống scroll dựa trên GSAP ScrollTrigger
- **Motion_Controller**: Component Vue quản lý tất cả animation state
- **Reduced_Motion_Mode**: Chế độ dự phòng khi `prefers-reduced-motion: reduce`
- **Crimson_Accent**: Màu đỏ thắm duy nhất (HSL hue 345-360, saturation 55-75%, lightness 35-50%)
- **Midnight_Base**: Màu nền chính deep navy/midnight (HSL hue 220-240, saturation 30-55%, lightness 5-12%)
- **Ivory_Text**: Màu chữ off-white (HSL hue 40-60, saturation 15-30%, lightness 88-95%)
- **Typography_Display**: Font display chính - Cormorant Garamond hoặc Canela (serif editorial, có lý do: brief là luxury/emotional/heritage)
- **Typography_Body**: Font body - Satoshi hoặc Geist (sans neutral, tương phản với display)
- **Particle_Field**: Trường hạt phát sáng nền, render trên canvas
- **Scroll_Progress**: Biến tiến độ scroll từ 0 đến 1 toàn trang

---

## Requirements

### Requirement 1: Cấu trúc dự án và công nghệ nền tảng

**User Story:** Là developer, tôi muốn một dự án Vue 3 được cấu hình đúng với tất cả dependencies cần thiết, để có thể bắt đầu xây dựng ngay lập tức.

#### Acceptance Criteria

1. THE Valentine_Website SHALL được khởi tạo bằng Vite + Vue 3 với `<script setup>` Composition API.
2. THE Valentine_Website SHALL sử dụng các dependencies chính xác gồm: `gsap` (với ScrollTrigger plugin), `@vueuse/core`, `@phosphor-icons/vue`.
3. THE Valentine_Website SHALL cấu hình Tailwind CSS v4 với `@tailwindcss/vite` plugin (không dùng `postcss.config.js` approach).
4. THE Valentine_Website SHALL self-host font bằng `@font-face` + `font-display: swap`, không link Google Fonts qua `<link>` tag.
5. THE Valentine_Website SHALL có file `src/styles/tokens.css` định nghĩa CSS custom properties cho ít nhất bốn nhóm token bắt buộc: (a) màu sắc (Midnight_Base, Ivory_Text, Crimson_Accent và các tonal variations), (b) typography scale (font-size levels, line-height, tracking), (c) spacing scale (section padding, content max-width), (d) z-index scale (particles, content, nav, modal). Mỗi nhóm phải có ít nhất một custom property được định nghĩa.
6. IF một component cần GSAP ScrollTrigger hoặc DOM scroll listener, THEN THE Motion_Controller SHALL isolate logic đó trong `onMounted` với cleanup trong `onUnmounted` bằng cách gọi `.kill()` trên mỗi ScrollTrigger instance và `removeEventListener` trên mỗi scroll listener đã đăng ký.
7. THE Valentine_Website SHALL KHÔNG sử dụng Inter làm font chính; font chính SHALL là một serif hoặc display font được self-host theo criterion 4. THE Valentine_Website SHALL KHÔNG dùng AI-purple gradient (#7c3aed, #8b5cf6 và các biến thể) làm màu accent chính. THE Valentine_Website SHALL KHÔNG có layout 3 card đều nhau (equal-width columns) song song trên desktop.

---

### Requirement 2: Palette màu và hệ thống design token

**User Story:** Là designer, tôi muốn một palette màu premium, nhất quán và không trùng với AI-default, để website truyền cảm giác xa xỉ và cảm xúc thực sự.

#### Acceptance Criteria

1. THE Valentine_Website SHALL sử dụng duy nhất một accent color là Crimson_Accent với hue 345-360, saturation 55-75%, lightness 35-50% (không phải đỏ rực với saturation > 90%).
2. THE Valentine_Website SHALL dùng Midnight_Base (hue 220-240, saturation 30-55%, lightness 5-12%) làm màu nền cho tất cả sections; không có section nào có background lightness > 25%.
3. THE Valentine_Website SHALL dùng Ivory_Text (hue 40-60, saturation 15-30%, lightness 88-95%) cho tất cả text chính, không dùng trắng thuần lightness 100%.
4. THE Valentine_Website SHALL KHÔNG sử dụng bất kỳ màu nào với hue 30-60, saturation > 15%, lightness > 80% (dải beige/cream) làm background, cũng KHÔNG dùng màu với hue 25-45, saturation 30-70%, lightness 30-55% (dải brass/ochre/oxblood) làm accent, cũng KHÔNG dùng màu với hue 25-40, saturation 20-50%, lightness 8-14% (dải espresso) làm màu text chính.
5. THE Valentine_Website SHALL KHÔNG có bóng đổ với màu `#000000` thuần hoặc `rgba(0,0,0,x)` thuần; bóng đổ SHALL pha trộn ít nhất 10% hue của Crimson_Accent vào màu bóng, với opacity 40-70%.
6. THE Valentine_Website SHALL dùng border-radius `0px` (all-sharp) nhất quán cho tất cả elements trên toàn trang.

---

### Requirement 3: Hệ thống typography

**User Story:** Là designer, tôi muốn typography có cảm giác editorial và cảm xúc, để từng chữ trở thành một phần của câu chuyện.

#### Acceptance Criteria

1. THE Valentine_Website SHALL dùng Typography_Display (Cormorant Garamond hoặc Canela) cho tất cả h1, h2, và eyebrow-scale elements - đây là brief luxury/emotional/heritage, đủ điều kiện dùng serif theo quy tắc taste-skill.
2. THE Valentine_Website SHALL dùng Typography_Body (Satoshi hoặc Geist, sans-serif) cho body copy và UI elements; font-size của Typography_Body SHALL không vượt quá 1.25rem ở base scale, tạo tương phản serif/sans rõ ràng với Typography_Display.
3. THE Valentine_Website SHALL KHÔNG dùng Fraunces và KHÔNG dùng Instrument_Serif ở bất kỳ đâu trên trang.
4. WHEN italic được dùng trong display type với chữ có descender (`y g j p q`), THE Valentine_Website SHALL áp dụng `line-height` tối thiểu 1.1 và thêm `padding-bottom: 0.25rem` reserve trên wrapping element.
5. THE Valentine_Website SHALL KHÔNG sử dụng em-dash (`—`) ở bất kỳ đâu trên trang - trong headlines, eyebrows, body copy, quotes, attribution, captions, buttons, alt text.
6. THE Valentine_Website SHALL có display headline ở Hero_Section với font-size tối thiểu `3rem` (text-5xl) trên mobile và `4.5rem` (text-7xl) trên viewport >= 768px, với letter-spacing tighter và line-height <= 1.
7. IF Hero_Section headline được render trên viewport >= 768px với font-size >= 4.5rem, THEN headline text SHALL không vượt quá 60 ký tự tổng để tránh wrap quá 2 dòng.

---

### Requirement 4: Hero Section - Mở màn câu chuyện

**User Story:** Là người xem, tôi muốn khi vào trang lần đầu bị cuốn hút ngay lập tức bởi một hình ảnh và chuyển động mạnh, để cảm giác đây là điều gì đó đặc biệt.

#### Acceptance Criteria

1. THE Hero_Section SHALL có min-height 100dvh (không dùng 100vh) với nền Midnight_Base, không có overflow clip ẩn content.
2. THE Hero_Section SHALL có cấu trúc bất đối xứng: text column chiếm không quá 55% viewport width, asset column chiếm phần còn lại; text SHALL left-aligned, không center.
3. THE Hero_Section SHALL bao gồm tối đa 4 text elements: (1) eyebrow nhỏ uppercase tracking, (2) headline display tối đa 2 dòng, (3) subtext tối đa 20 từ, (4) một CTA button duy nhất.
4. THE Hero_Section SHALL KHÔNG có: tagline nhỏ bên dưới CTA, logo wall, trust badges, version labels (v1.0, beta, alpha), decoration text strip.
5. THE Hero_Section SHALL có Particle_Field ở background render trên canvas element với pointer-events: none; mỗi particle SHALL có opacity trong khoảng 0.3-0.7 và màu trong dải Crimson_Accent hoặc Ivory_Text.
6. WHEN trang load và prefers-reduced-motion là not set hoặc no-preference, THE Hero_Section SHALL kích hoạt entrance animation: mỗi whitespace-split word của headline xuất hiện từ vị trí 40px bên dưới với opacity 0 -> 1, easing cubic-bezier(0.16, 1, 0.3, 1), duration 1.2s, stagger 0.08s.
7. THE Hero_Section SHALL có top padding tối đa 6rem (pt-24) trên desktop; CTA button SHALL visible trong viewport trên thiết bị có width >= 320px và height >= 568px mà không cần scroll.
8. THE Hero_Section SHALL có ít nhất một ảnh thực (không phải colored div, không phải SVG placeholder); ảnh SHALL render với correct aspect-ratio.
9. IF prefers-reduced-motion: reduce, THEN THE Hero_Section SHALL hiển thị static: không có transform transitions, không có opacity transitions, Particle_Field SHALL không render.

---

### Requirement 5: Scroll Engine và storytelling qua cuộn trang

**User Story:** Là người xem, tôi muốn việc cuộn trang là một hành trình cảm xúc, mỗi đoạn scroll tiết lộ một phần câu chuyện mới, để tôi không thể dừng cuộn.

#### Acceptance Criteria

1. THE Scroll_Engine SHALL sử dụng GSAP ScrollTrigger cho tất cả scroll-driven animation; không có `window.addEventListener('scroll')` nào được đăng ký, không có `scrollY` nào được lưu vào Vue reactive state.
2. THE Scroll_Engine SHALL pin Hero_Section với scroll distance tối thiểu 150% viewport height (end: "+=150%") trước khi unpin.
3. WHEN scroll progress của Hero_Section pinned zone vượt qua 80% (tức là 80% của 150% viewport height đã được scroll), THE Scroll_Engine SHALL trigger Bloom_Effect một lần.
4. THE Story_Section SHALL dùng sticky-stack pattern: mỗi scene element có `position: sticky; top: 0`; WHEN scene N+1 scroll trigger bắt đầu, scene N SHALL animate scale từ 1.0 xuống 0.92 và opacity từ 1.0 xuống 0.0 với scrub.
5. THE Story_Section SHALL có ít nhất 3 scene; mỗi scene SHALL có ít nhất một visual asset với src URL khác nhau (không duplicate ảnh giữa các scene) và text copy tối đa 25 words.
6. THE Scroll_Engine SHALL implement horizontal scroll hijack cho Gallery_Section: `start: "top top"`, `pin: true`, `scrub: 1`, scroll distance = (track scrollWidth - viewport innerWidth).
7. WHEN GSAP context được tạo trong onMounted, THE Scroll_Engine SHALL gọi `ctx.revert()` trong onUnmounted để cleanup.
8. IF prefers-reduced-motion: reduce, THEN THE Scroll_Engine SHALL disable tất cả pin, scrub, hijack; tất cả sections SHALL scroll normally theo DOM order không có position sticky/fixed.
9. THE Scroll_Engine SHALL KHÔNG render text labels `Scroll`, `↓ scroll`, `Scroll to explore`, hay bất kỳ animated scroll indicator nào ở bất kỳ section nào.

---

### Requirement 6: Gallery Section - Hành trình hình ảnh ngang

**User Story:** Là người xem, tôi muốn một section hình ảnh cinematic khác biệt, không phải grid thông thường, để cảm giác như đang lật qua những trang ký ức.

#### Acceptance Criteria

1. THE Gallery_Section SHALL render với một wrapper element có overflow: hidden và một inner track element; WHEN user scroll dọc qua Gallery_Section, THE inner track SHALL translate ngang theo scrub value.
2. THE Gallery_Section SHALL chứa ít nhất 4 ảnh; không có hai ảnh liên tiếp nào được phép có cùng aspect ratio (16:9, 3:4, 1:1, 9:16 phải xuất hiện theo thứ tự không đều nhau).
3. THE Gallery_Section SHALL dùng ảnh thực với src URL chứa Picsum seed descriptive (ví dụ `valentine-romantic-film`, `valentine-soft-light`, `valentine-hands-together`, `valentine-bokeh-night`); không có `<div>` nào được dùng thay cho `<img>` element.
4. WHEN mouse pointer enter vào một ảnh, THE ảnh element SHALL apply 3D transform với rotateX và rotateY tối đa ±5 degrees theo tọa độ cursor tương đối trong ảnh đó.
5. WHEN mouse pointer leave khỏi ảnh, THE ảnh element SHALL animate 3D transform trở về rotateX: 0, rotateY: 0 trong 0.3s.
6. THE Gallery_Section SHALL render caption text bên dưới mỗi ảnh, với caption element nằm ngoài img/picture element (không overlay); caption SHALL dùng Typography_Body, font-size <= 0.875rem, Ivory_Text color với opacity 0.6.
7. THE Gallery_Section SHALL KHÔNG render bất kỳ text element nào có position: absolute hoặc position: fixed overlap lên img element.
8. IF prefers-reduced-motion: reduce, THEN Gallery_Section SHALL disable horizontal scroll hijack (Req 5 criterion 8 applies) và disable parallax tilt; ảnh SHALL display statically in a vertical scroll layout.

---

### Requirement 7: Message Section - Trung tâm cảm xúc

**User Story:** Là người tặng website, tôi muốn một section để thông điệp tình yêu được đặt ở trung tâm với cảm xúc mạnh nhất, để người nhận cảm thấy được yêu thật sự.

#### Acceptance Criteria

1. THE Message_Section SHALL có min-height 100dvh; không có img, video, hay icon element nào được render bên cạnh hoặc overlay lên headline text; chữ là visual chính duy nhất.
2. THE Message_Section SHALL dùng Typography_Display ở font-size tối thiểu 3rem mobile / 5rem desktop; italic SHALL được áp dụng cho 1-3 words key trong headline, SHALL dùng italic style của cùng Typography_Display font (không mix với Typography_Body hoặc font khác).
3. WHEN Message_Section có ít nhất 50% trong viewport và prefers-reduced-motion là no-preference, THE Message_Section SHALL trigger text reveal: mỗi whitespace-split word animate opacity 0->1 và translateY 20px->0, stagger 0.05s, tổng duration từ first word đến last word không quá 2s.
4. THE Message_Section SHALL có nền Midnight_Base với radial-gradient Crimson_Accent ở center, radius tối đa 40% viewport width, opacity tối đa 15%, không có màu light-mode nào (lightness > 25%) trong background layer.
5. THE Message_Section SHALL KHÔNG có ký tự em-dash (`—`) trong bất kỳ visible text node nào.
6. THE Message_Section SHALL render subtext với tối đa 3 dòng trên viewport >= 768px (tối đa 80 ký tự tổng để đảm bảo 3-line wrap); subtext SHALL dùng Typography_Body, opacity 0.7, positioned sau headline trong DOM order.
7. IF prefers-reduced-motion: reduce, THEN Message_Section SHALL hiển thị tất cả text ở trạng thái final (opacity 1, translateY 0) ngay lập tức không animate.

---

### Requirement 8: Bloom Effect - Animation ký danh

**User Story:** Là người xem, tôi muốn thấy một animation đặc trưng của website mà ở nơi khác không có, để khoảnh khắc đó trở nên đáng nhớ.

#### Acceptance Criteria

1. THE Bloom_Effect SHALL render SVG inline trong BloomEffect.vue component với ít nhất 5 petal path elements; mỗi path SHALL có `stroke-dasharray` và `stroke-dashoffset` được set bằng JavaScript để chuẩn bị cho animation.
2. THE Bloom_Effect SHALL dùng linearGradient hoặc stroke color là Crimson_Accent (hue 345-360, saturation 55-75%) cho stroke của tất cả petal paths; không dùng fill, chỉ dùng stroke.
3. WHEN Scroll_Engine trigger Bloom_Effect (per Requirement 5 criterion 3), THE Bloom_Effect SHALL begin animating stroke-dashoffset từ full path length xuống 0 trên tất cả petal paths.
4. THE Bloom_Effect SHALL hoàn thành toàn bộ animation trong 1.5s với easing power2.inOut; tất cả petals SHALL animated trong cùng 1.5s window (có thể stagger nhỏ trong window đó).
5. THE Bloom_Effect SHALL sử dụng GSAP để animate stroke-dashoffset; không có CSS `animation` hay CSS `transition` property nào được áp dụng trên petal paths.
6. IF prefers-reduced-motion: reduce, THEN THE Bloom_Effect SHALL set tất cả petal path stroke-dashoffset về 0 ngay lập tức trong một animation frame, không có intermediate states.
7. THE Bloom_Effect SHALL được render trên một Vue component riêng biệt `BloomEffect.vue` với SVG markup inline; không có `<img src="*.svg">` hay `<use href="*.svg#...">` external reference.
8. WHEN Bloom_Effect animation hoàn thành, THE petal paths SHALL maintain stroke-dashoffset: 0 (fully drawn) cho phần còn lại của page session; không tự reset hay loop.
9. THE Bloom_Effect SHALL animate chỉ một lần mỗi page session; nếu user scroll ngược lại vào vùng trigger, animation SHALL không re-play.

---

### Requirement 9: Navigation và layout tổng thể

**User Story:** Là người dùng, tôi muốn navigation nhẹ nhàng, không chiếm diện tích, và layout tổng thể mang lại cảm giác cinematic, để trải nghiệm liền mạch không bị gián đoạn.

#### Acceptance Criteria

1. THE Valentine_Website SHALL có navigation bar với height tối đa 72px, position fixed hoặc sticky, chứa đúng hai interactive elements: logo/brand mark bên trái và một CTA button bên phải; background SHALL transparent hoặc có opacity < 0.9 khi overlap Hero_Section.
2. THE Valentine_Website SHALL render tất cả navigation elements trên một dòng duy nhất trên viewport >= 768px; không có nav child element nào được phép wrap xuống dòng thứ hai.
3. THE Valentine_Website SHALL sử dụng ít nhất 4 layout families khác nhau: (a) pinned-scroll-hero, (b) sticky-stack, (c) horizontal-scroll-hijack, (d) editorial-manifesto (typography-only full-viewport); không có hai section liên tiếp nào dùng cùng layout family.
4. THE Valentine_Website SHALL có tổng số eyebrow label elements (uppercase + tracking-wide micro-labels trên section headings) không vượt quá ceil(total_section_count / 3); Hero_Section tính là 1 section.
5. THE Valentine_Website SHALL KHÔNG có layout với 3 hoặc nhiều columns có equal width (sai lệch < 5%) song song trong bất kỳ section nào.
6. THE Valentine_Website SHALL dùng `max-width: 1400px; margin-inline: auto` làm content wrapper cho sections có text; các sections SHALL dùng asymmetric inline padding (left padding và right padding chênh nhau ít nhất 8vw).
7. WHEN viewport width < 768px, THE Valentine_Website SHALL collapse tất cả multi-column asymmetric layouts về single-column layout với width: 100% và inline padding 1rem (16px) mỗi bên.

---

### Requirement 10: Performance và accessibility

**User Story:** Là người dùng, tôi muốn website tải nhanh và accessible, để trải nghiệm không bị gián đoạn bởi lag hay barrier kỹ thuật.

#### Acceptance Criteria

1. THE Valentine_Website SHALL có Largest Contentful Paint < 2.5s; hero image SHALL có width và height attributes set để browser có thể calculate aspect ratio trước khi load; fonts SHALL có font-display: swap để tránh FOIT.
2. THE Valentine_Website SHALL không có bất kỳ element nào có `will-change: transform` hoặc `will-change: opacity` ngoài các elements đang actively animate (tức là trong khi GSAP hoặc CSS animation đang running).
3. THE Particle_Field SHALL render trên `<canvas>` element với `pointer-events: none`; canvas SHALL không trigger layout recalculation của DOM elements khác trong animation loop.
4. THE Valentine_Website SHALL chỉ animate `transform` property và `opacity` property; không có animation nào thay đổi `top`, `left`, `right`, `bottom`, `width`, `height`, `margin`, `padding`.
5. THE Valentine_Website SHALL có z-index values được document trong tokens.css với 4 named layers tối thiểu: particles (0), content (10), nav (50), modal (100); không có arbitrary z-index value nào được hard-code trong component files.
6. WHEN một img element chưa load, THE surrounding container SHALL maintain correct height dựa trên aspect-ratio CSS property hoặc explicit width/height attributes, để tránh Cumulative Layout Shift.
7. THE Valentine_Website SHALL có contrast ratio tối thiểu 4.5:1 giữa Ivory_Text và Midnight_Base cho body text (< 18px); contrast ratio tối thiểu 3:1 cho large text (>= 18px normal weight hoặc >= 14px bold); Crimson_Accent trên Midnight_Base SHALL pass 3:1 minimum cho large text.
8. THE Valentine_Website SHALL có `alt` attribute mô tả nội dung (không trống) cho tất cả `<img>` elements mang thông tin; purely decorative img elements (nếu có) SHALL có `alt=""` và `aria-hidden="true"`.
9. IF prefers-reduced-motion: reduce, THEN Valentine_Website SHALL disable tất cả GSAP animations, CSS transitions, và CSS animations; tất cả elements SHALL appear ở final visual state.
10. WHEN grain/noise texture filter được apply, THE filter SHALL only apply trên element với `position: fixed` và `pointer-events: none`; không apply trên elements trong scroll container.

---

### Requirement 11: Closing Section và CTA cuối

**User Story:** Là người tặng website, tôi muốn trang kết thúc bằng một khoảnh khắc yên tĩnh và một lời kêu gọi hành động (ví dụ: chia sẻ, lưu ngày), để trải nghiệm có điểm đóng cảm xúc hoàn chỉnh.

#### Acceptance Criteria

1. THE Valentine_Website SHALL có closing section sau Message_Section với min-height 100vh chứa đúng 2 visible elements: một text node (font-size <= 14px, <= 10 words) và một CTA button; không có image, icon decorative, hay additional text block nào khác trong section này.
2. THE Valentine_Website SHALL có CTA button với label tối đa 3 words.
3. IF viewport width >= 1024px, THEN CTA button label SHALL render trên một dòng duy nhất không wrap; button SHALL không có max-width constraint nhỏ hơn label text width + 48px horizontal padding.
4. THE Valentine_Website SHALL KHÔNG có hai CTA elements với cùng action intent (share hoặc save-date) xuất hiện trên cùng một trang; chỉ có một CTA với một intent duy nhất tồn tại.
5. WHEN mouse pointer hover trên CTA button, THE button background SHALL animate fill từ phía edge gần cursor nhất, với Crimson_Accent color, completing fill trong <= 300ms.
6. THE Valentine_Website SHALL KHÔNG render scroll cue indicators, version labels, locale/timezone strips, hay decorative text strips ở bottom edge của bất kỳ section nào.
7. THE Valentine_Website SHALL có footer element chứa chỉ một copyright text node; không có navigation links, social media links, logo, additional text, hay icon elements nào trong footer.
