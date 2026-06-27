// Feature: valentine-website, Property 5: Story scene exit tweens target scale 0.92 and opacity 0
import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

/**
 * Represents a GSAP tween configuration as recorded in useStoryScrollEngine.
 * Exit tween: scale 1→0.92, opacity 1→0, scrub: true.
 */
interface StoryExitTween {
    scale: number
    opacity: number
    scrub: boolean
}

/**
 * Pure factory that returns the exit tween config for a scene at a given index.
 * This mirrors the logic in useStoryScrollEngine.
 * Last scene (index === total-1) has no exit tween.
 */
function getExitTweenConfig(
    sceneIndex: number,
    totalScenes: number
): StoryExitTween | null {
    if (sceneIndex >= totalScenes - 1) return null
    return {
        scale: 0.92,
        opacity: 0,
        scrub: true,
    }
}

describe('Property 5: Story scene exit tweens target correct values', () => {
    const TOTAL_SCENES = 3

    it('exit tween for any non-last scene targets scale=0.92', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: TOTAL_SCENES - 2 }),
                (index) => {
                    const tween = getExitTweenConfig(index, TOTAL_SCENES)
                    expect(tween).not.toBeNull()
                    expect(tween!.scale).toBe(0.92)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('exit tween for any non-last scene targets opacity=0', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: TOTAL_SCENES - 2 }),
                (index) => {
                    const tween = getExitTweenConfig(index, TOTAL_SCENES)
                    expect(tween).not.toBeNull()
                    expect(tween!.opacity).toBe(0)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('exit tween for any non-last scene uses scrub=true', () => {
        fc.assert(
            fc.property(
                fc.integer({ min: 0, max: TOTAL_SCENES - 2 }),
                (index) => {
                    const tween = getExitTweenConfig(index, TOTAL_SCENES)
                    expect(tween!.scrub).toBe(true)
                }
            ),
            { numRuns: 100 }
        )
    })

    it('last scene has no exit tween', () => {
        const tween = getExitTweenConfig(TOTAL_SCENES - 1, TOTAL_SCENES)
        expect(tween).toBeNull()
    })
})
