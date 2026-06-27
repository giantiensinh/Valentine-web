// src/composables/useScrollEngine.ts
import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useReducedMotion } from './useReducedMotion'
import type { Ref } from 'vue'

gsap.registerPlugin(ScrollTrigger)

/**
 * Pins the hero section for 150% viewport height.
 * Fires onBloomTrigger exactly once when scroll progress >= 0.8.
 * No-ops when prefers-reduced-motion: reduce.
 *
 * Key fixes:
 * - anticipatePin: 1 prevents the scroll position jump on pin start
 * - ScrollTrigger.refresh() called after all images load ensures correct geometry
 */
export function useHeroScrollEngine(
    sectionRef: Ref<HTMLElement | undefined>,
    onBloomTrigger: () => void
): void {
    const { isReduced } = useReducedMotion()
    let ctx: gsap.Context | null = null
    let bloomFired = false

    onMounted(() => {
        if (isReduced.value || !sectionRef.value) return

        ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: sectionRef.value,
                start: 'top top',
                end: '+=150%',
                pin: true,
                anticipatePin: 1,
                onUpdate(self) {
                    if (self.progress >= 0.8 && !bloomFired) {
                        bloomFired = true
                        onBloomTrigger()
                    }
                },
            })
        }, sectionRef.value)

        // Refresh ScrollTrigger after all page images finish loading
        // so pin calculations use correct final geometry.
        if (document.readyState === 'complete') {
            ScrollTrigger.refresh()
        } else {
            window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
        }

        // Additional refresh after fonts settle (web fonts can shift layout)
        document.fonts.ready.then(() => {
            ScrollTrigger.refresh()
        })
    })

    onUnmounted(() => {
        ctx?.revert()
        ctx = null
    })
}

/**
 * Implements sticky-stack exit animation for story scenes.
 * Each scene exits with scale 1→0.92 and opacity 1→0 as the next scene scrolls in.
 * Text within each scene fades in when the scene becomes active.
 * No-ops when prefers-reduced-motion: reduce.
 */
export function useStoryScrollEngine(
    sectionRef: Ref<HTMLElement | undefined>,
    sceneRefs: Ref<HTMLElement[]>
): void {
    const { isReduced } = useReducedMotion()
    let ctx: gsap.Context | null = null

    onMounted(() => {
        if (isReduced.value || !sectionRef.value) return

        ctx = gsap.context(() => {
            sceneRefs.value.forEach((scene, i) => {
                // Fade in scene text when scene enters viewport
                const sceneText = scene.querySelector<HTMLElement>('.scene-text')
                if (sceneText) {
                    gsap.from(sceneText, {
                        opacity: 0,
                        y: 30,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: scene,
                            start: 'top 60%',
                            toggleActions: 'play none none none',
                        },
                    })
                }

                // Last scene has no exit animation
                if (i === sceneRefs.value.length - 1) return

                const nextScene = sceneRefs.value[i + 1]
                gsap.to(scene, {
                    scale: 0.92,
                    opacity: 0,
                    ease: 'none',
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

    onUnmounted(() => {
        ctx?.revert()
        ctx = null
    })
}

/**
 * Implements horizontal scroll hijack for the gallery section.
 * Pins the section and translates the track element horizontally as the user scrolls.
 * Also fades out the scroll hint as soon as the user starts scrolling the gallery.
 * No-ops when prefers-reduced-motion: reduce.
 */
export function useGalleryScrollEngine(
    sectionRef: Ref<HTMLElement | undefined>,
    trackRef: Ref<HTMLElement | undefined>
): void {
    const { isReduced } = useReducedMotion()
    let ctx: gsap.Context | null = null

    onMounted(() => {
        if (isReduced.value || !sectionRef.value || !trackRef.value) return

        ctx = gsap.context(() => {
            const track = trackRef.value!
            const getDistance = () => track.scrollWidth - window.innerWidth

            gsap.to(track, {
                x: () => -getDistance(),
                ease: 'none',
                scrollTrigger: {
                    trigger: sectionRef.value,
                    start: 'top top',
                    end: () => `+=${getDistance()}`,
                    pin: true,
                    anticipatePin: 1,
                    scrub: 1,
                    invalidateOnRefresh: true,
                },
            })

            // Fade out scroll hint as user scrolls into gallery
            const hint = sectionRef.value!.querySelector('.gallery-hint')
            if (hint) {
                gsap.to(hint, {
                    opacity: 0,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: sectionRef.value,
                        start: 'top top',
                        end: '+=20%',
                        scrub: true,
                    },
                })
            }
        }, sectionRef.value)

        // Refresh after fonts and images load to ensure correct scrollWidth calculation
        document.fonts.ready.then(() => {
            ScrollTrigger.refresh()
        })

        if (document.readyState === 'complete') {
            ScrollTrigger.refresh()
        } else {
            window.addEventListener('load', () => ScrollTrigger.refresh(), { once: true })
        }
    })

    onUnmounted(() => {
        ctx?.revert()
        ctx = null
    })
}
