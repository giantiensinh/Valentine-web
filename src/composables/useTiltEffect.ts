// src/composables/useTiltEffect.ts
import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import type { Ref } from 'vue'

/**
 * Applies a 3D tilt effect to an element based on mouse cursor position.
 *
 * On mousemove: rotateY = cx * 10, rotateX = -cy * 10
 *   where cx/cy are normalized coordinates in [-0.5, 0.5]
 *   → max rotation is ±5 degrees (satisfies Property 6)
 *
 * On mouseleave: animate back to rotateX: 0, rotateY: 0 in 0.3s
 *
 * Uses GSAP exclusively (no CSS transition/animation on the element).
 * Cleans up event listeners in onUnmounted.
 */
export function useTiltEffect(el: Ref<HTMLElement | undefined>): void {
    function onMouseMove(e: MouseEvent): void {
        if (!el.value) return
        const rect = el.value.getBoundingClientRect()
        // Normalize to [-0.5, 0.5]
        const cx = (e.clientX - rect.left) / rect.width - 0.5
        const cy = (e.clientY - rect.top) / rect.height - 0.5

        gsap.to(el.value, {
            rotateY: cx * 10,   // max ±5deg (cx ∈ [-0.5, 0.5])
            rotateX: -cy * 10,  // max ±5deg
            transformPerspective: 800,
            ease: 'power1.out',
            duration: 0.1,
            overwrite: true,
        })
    }

    function onMouseLeave(): void {
        if (!el.value) return
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
