// src/composables/useReducedMotion.ts
import { computed } from 'vue'
import { usePreferredReducedMotion } from '@vueuse/core'
import type { ComputedRef } from 'vue'

/**
 * Composable that detects the user's reduced-motion preference.
 * Returns isReduced: true when prefers-reduced-motion: reduce is active.
 * Used to guard all GSAP animations, ScrollTrigger registrations,
 * and canvas-based particle effects throughout the app.
 */
export function useReducedMotion(): { isReduced: ComputedRef<boolean> } {
    const preference = usePreferredReducedMotion()
    const isReduced = computed(() => preference.value === 'reduce')
    return { isReduced }
}
