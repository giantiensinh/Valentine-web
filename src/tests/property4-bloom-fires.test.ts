// Feature: valentine-website, Property 4: Bloom fires at scroll progress >= 0.8 and not before
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Pure function extracted from useHeroScrollEngine logic.
 * Simulates the bloom trigger guard.
 * Returns whether bloom should fire given a progress value and prior fired state.
 */
function shouldFireBloom(progress: number, alreadyFired: boolean): boolean {
    if (alreadyFired) return false
    return progress >= 0.8
}

describe('Property 4: Bloom fires at scroll progress >= 0.8 and not before', () => {
    it('bloom fires for any progress >= 0.8 (when not yet fired)', () => {
        fc.assert(
            fc.property(
                fc.float({ min: Math.fround(0.8), max: Math.fround(1.0), noNaN: true }),
                (progress) => {
                    expect(shouldFireBloom(progress, false)).toBe(true)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('bloom does NOT fire for any progress < 0.8', () => {
        fc.assert(
            fc.property(
                fc.float({ min: Math.fround(0), max: Math.fround(0.7999), noNaN: true }),
                (progress) => {
                    expect(shouldFireBloom(progress, false)).toBe(false)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('bloom does NOT fire again if already fired (idempotency)', () => {
        fc.assert(
            fc.property(
                fc.float({ min: Math.fround(0), max: Math.fround(1.0), noNaN: true }),
                (progress) => {
                    // Once bloom has fired, it must never fire again regardless of progress
                    expect(shouldFireBloom(progress, true)).toBe(false)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('boundary: exactly 0.8 triggers bloom', () => {
        expect(shouldFireBloom(0.8, false)).toBe(true)
    })

    it('boundary: 0.7999 does not trigger bloom', () => {
        expect(shouldFireBloom(0.7999, false)).toBe(false)
    })
})
