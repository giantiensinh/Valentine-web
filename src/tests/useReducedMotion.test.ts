// Feature: valentine-website, Property: reduced motion detection
import { describe, it, expect, vi, afterEach } from 'vitest'
import { useReducedMotion } from '../composables/useReducedMotion'

// @vueuse/core reads window.matchMedia — mock it for testing
function mockMatchMedia(matches: boolean) {
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: vi.fn().mockImplementation((query: string) => ({
            matches: query.includes('reduce') ? matches : false,
            media: query,
            onchange: null,
            addListener: vi.fn(),
            removeListener: vi.fn(),
            addEventListener: vi.fn(),
            removeEventListener: vi.fn(),
            dispatchEvent: vi.fn(),
        })),
    })
}

describe('useReducedMotion', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it('returns isReduced = false when prefers-reduced-motion is no-preference', () => {
        mockMatchMedia(false)
        const { isReduced } = useReducedMotion()
        expect(isReduced.value).toBe(false)
    })

    it('returns isReduced = true when prefers-reduced-motion: reduce matches', () => {
        mockMatchMedia(true)
        const { isReduced } = useReducedMotion()
        expect(isReduced.value).toBe(true)
    })

    it('exports isReduced as a ComputedRef (has .value property)', () => {
        mockMatchMedia(false)
        const { isReduced } = useReducedMotion()
        expect(isReduced).toHaveProperty('value')
    })
})
