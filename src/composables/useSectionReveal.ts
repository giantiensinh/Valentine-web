// src/composables/useSectionReveal.ts
/**
 * Adds a CSS class 'is-visible' to an element when it enters the viewport.
 * Used for section fade/slide-in transitions.
 *
 * Usage in Vue template:
 *   <section ref="sectionRef" class="reveal-section"> ... </section>
 *
 * Then in <script setup>:
 *   useSectionReveal(sectionRef)
 *
 * CSS pattern (in component style or global):
 *   .reveal-section { opacity: 0; transform: translateY(24px); transition: ... }
 *   .reveal-section.is-visible { opacity: 1; transform: none; }
 *
 * Respects prefers-reduced-motion automatically.
 */
import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

export function useSectionReveal(
    elRef: Ref<HTMLElement | undefined>,
    options: { threshold?: number; delay?: number } = {}
): void {
    const { threshold = 0.15, delay = 0 } = options

    let observer: IntersectionObserver | null = null

    onMounted(() => {
        // Skip if user prefers reduced motion — leave element visible by default
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            if (elRef.value) elRef.value.classList.add('is-visible')
            return
        }

        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const el = entry.target as HTMLElement
                        if (delay) {
                            setTimeout(() => el.classList.add('is-visible'), delay)
                        } else {
                            el.classList.add('is-visible')
                        }
                        observer?.unobserve(el)
                    }
                })
            },
            { threshold }
        )

        if (elRef.value) {
            observer.observe(elRef.value)
        }
    })

    onUnmounted(() => {
        observer?.disconnect()
        observer = null
    })
}
