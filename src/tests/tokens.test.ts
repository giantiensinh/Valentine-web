// Feature: valentine-website, Property: token system validation
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const tokensCss = readFileSync(
    join(process.cwd(), 'src/styles/tokens.css'),
    'utf-8'
)

describe('Design Token System', () => {
    // ── Color tokens ────────────────────────────────────────────────
    describe('Color tokens', () => {
        it('defines --color-midnight-900 token', () => {
            expect(tokensCss).toContain('--color-midnight-900')
        })

        it('defines --color-ivory token', () => {
            expect(tokensCss).toContain('--color-ivory:')
        })

        it('defines --color-crimson token', () => {
            expect(tokensCss).toContain('--color-crimson:')
        })

        it('defines --shadow-base token', () => {
            expect(tokensCss).toContain('--shadow-base')
        })

        it('Crimson_Accent hue is in range 345-360', () => {
            // Extract hsl value of --color-crimson
            const match = tokensCss.match(/--color-crimson:\s*hsl\((\d+)/)
            expect(match).not.toBeNull()
            const hue = Number(match![1])
            expect(hue).toBeGreaterThanOrEqual(345)
            expect(hue).toBeLessThanOrEqual(360)
        })

        it('Crimson_Accent saturation is in range 55-75%', () => {
            const match = tokensCss.match(/--color-crimson:\s*hsl\(\d+\s+(\d+)%/)
            expect(match).not.toBeNull()
            const sat = Number(match![1])
            expect(sat).toBeGreaterThanOrEqual(55)
            expect(sat).toBeLessThanOrEqual(75)
        })

        it('Crimson_Accent lightness is in range 35-50%', () => {
            const match = tokensCss.match(/--color-crimson:\s*hsl\(\d+\s+\d+%\s+(\d+)%/)
            expect(match).not.toBeNull()
            const light = Number(match![1])
            expect(light).toBeGreaterThanOrEqual(35)
            expect(light).toBeLessThanOrEqual(50)
        })

        it('Midnight_Base lightness is in range 5-12%', () => {
            const match = tokensCss.match(/--color-midnight-900:\s*hsl\(\d+\s+\d+%\s+(\d+)%/)
            expect(match).not.toBeNull()
            const light = Number(match![1])
            expect(light).toBeGreaterThanOrEqual(5)
            expect(light).toBeLessThanOrEqual(12)
        })

        it('Ivory_Text lightness is in range 88-95%', () => {
            const match = tokensCss.match(/--color-ivory:\s*hsl\(\d+\s+\d+%\s+(\d+)%/)
            expect(match).not.toBeNull()
            const light = Number(match![1])
            expect(light).toBeGreaterThanOrEqual(88)
            expect(light).toBeLessThanOrEqual(95)
        })
    })

    // ── Typography tokens ───────────────────────────────────────────
    describe('Typography tokens', () => {
        it('defines --font-display token', () => {
            expect(tokensCss).toContain('--font-display')
        })

        it('defines --font-body token', () => {
            expect(tokensCss).toContain('--font-body')
        })

        it('defines at least 5 --text-* scale tokens', () => {
            const matches = tokensCss.match(/--text-\w+:/g) ?? []
            expect(matches.length).toBeGreaterThanOrEqual(5)
        })
    })

    // ── Spacing tokens ──────────────────────────────────────────────
    describe('Spacing tokens', () => {
        it('defines --section-pad-x token', () => {
            expect(tokensCss).toContain('--section-pad-x:')
        })

        it('defines --section-pad-y token', () => {
            expect(tokensCss).toContain('--section-pad-y:')
        })

        it('defines --content-max-w token', () => {
            expect(tokensCss).toContain('--content-max-w')
        })
    })

    // ── Z-index tokens ──────────────────────────────────────────────
    describe('Z-index tokens', () => {
        it('--z-particles is 0', () => {
            expect(tokensCss).toMatch(/--z-particles:\s*0/)
        })

        it('--z-content is 10', () => {
            expect(tokensCss).toMatch(/--z-content:\s*10/)
        })

        it('--z-nav is 50', () => {
            expect(tokensCss).toMatch(/--z-nav:\s*50/)
        })

        it('--z-modal is 100', () => {
            expect(tokensCss).toMatch(/--z-modal:\s*100/)
        })
    })
})
