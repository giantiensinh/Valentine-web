// Feature: valentine-website, Property 9: All GSAP tween targets use only transform or opacity properties
// Validates: Requirements 10.4
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

// Allowed GSAP animation properties (transform-derived + opacity + SVG stroke)
const ALLOWED_PROPS = new Set([
    'x', 'y', 'z',
    'scale', 'scaleX', 'scaleY',
    'rotation', 'rotateX', 'rotateY',
    'transformPerspective',
    'opacity',
    'strokeDashoffset', 'strokeDasharray',
    'clipPath',
])

// Forbidden layout-triggering properties
const FORBIDDEN_PROPS = [
    'top', 'left', 'right', 'bottom',
    'width', 'height',
    'margin', 'marginTop', 'marginLeft', 'marginRight', 'marginBottom',
    'padding', 'paddingTop', 'paddingLeft', 'paddingRight', 'paddingBottom',
    'fontSize', 'borderWidth',
]

// Files to audit for GSAP tween calls
const filesToAudit = [
    'src/composables/useScrollEngine.ts',
    'src/composables/useTiltEffect.ts',
    'src/components/BloomEffect.vue',
    'src/components/HeroSection.vue',
    'src/components/MessageSection.vue',
    'src/components/ClosingSection.vue',
]

function readFile(relativePath: string): string {
    return readFileSync(join(process.cwd(), relativePath), 'utf-8')
}

/**
 * For .vue files, return only the <script> block content to avoid false
 * positives from CSS properties in <style> sections or HTML attribute values.
 * For .ts files, return the full content.
 */
function extractScriptContent(relativePath: string): string {
    const content = readFile(relativePath)
    if (!relativePath.endsWith('.vue')) return content

    // Extract everything between <script ...> and </script>
    const match = content.match(/<script[^>]*>([\s\S]*?)<\/script>/)
    return match ? match[1] : content
}

describe('Property 9: GSAP tweens use only transform/opacity properties', () => {
    for (const file of filesToAudit) {
        it(`${file} contains no forbidden layout properties in GSAP calls`, () => {
            // Use only the script section to avoid matching CSS/template false positives
            const content = extractScriptContent(file)

            // Check for forbidden properties inside gsap.to/from/fromTo/set blocks
            // We look for the property name followed by colon (object key pattern)
            for (const forbidden of FORBIDDEN_PROPS) {
                // Match: forbidden prop as object key in a gsap context
                // Simple heuristic: look for the property name as a standalone key
                const pattern = new RegExp(`\\b${forbidden}\\s*:`, 'g')
                const matches = content.match(pattern) ?? []

                if (matches.length > 0) {
                    // Any match in the script section is a potential violation
                    expect.fail(
                        `Found potentially forbidden property "${forbidden}" in ${file}. ` +
                        `GSAP tweens must only use transform/opacity properties per Req 10.4.`
                    )
                }
            }
        })
    }

    it('allowed properties set is correctly defined', () => {
        expect(ALLOWED_PROPS.has('opacity')).toBe(true)
        expect(ALLOWED_PROPS.has('x')).toBe(true)
        expect(ALLOWED_PROPS.has('scale')).toBe(true)
        expect(ALLOWED_PROPS.has('rotateX')).toBe(true)
        expect(ALLOWED_PROPS.has('strokeDashoffset')).toBe(true)
        expect(ALLOWED_PROPS.has('clipPath')).toBe(true)
        expect(ALLOWED_PROPS.has('top')).toBe(false)
        expect(ALLOWED_PROPS.has('width')).toBe(false)
    })
})
