// src/composables/useHeartParticles.ts
import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface HeartParticle {
    // Target position on the heart curve
    tx: number
    ty: number
    // Current position
    x: number
    y: number
    // Velocity for spring-like return
    vx: number
    vy: number
    // Visual properties
    radius: number
    opacity: number
    hue: number
    saturation: number
    lightness: number
    // Alive offset for floating texture
    offsetAngle: number
    offsetRadius: number
    offsetSpeed: number
    // Phase for individual floating
    phase: number
}

const PARTICLE_COUNT = 800
// Spring physics constants
const SPRING = 0.045
const DAMPING = 0.82
const FLOAT_AMPLITUDE = 1.8

/** Generate target points on the parametric heart shape */
function generateHeartPoints(count: number, cx: number, cy: number, scale: number): Array<{ x: number; y: number }> {
    const points: Array<{ x: number; y: number }> = []
    // We oversample and pick uniformly distributed points
    const steps = count * 4
    const candidates: Array<{ x: number; y: number }> = []

    for (let i = 0; i < steps; i++) {
        const t = (i / steps) * Math.PI * 2
        // Parametric heart: x = 16sin³(t), y = 13cos(t) - 5cos(2t) - 2cos(3t) - cos(4t)
        const hx = 16 * Math.pow(Math.sin(t), 3)
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
        candidates.push({ x: cx + hx * scale, y: cy + hy * scale })
    }

    // Pick uniformly spaced points
    const stride = Math.floor(candidates.length / count)
    for (let i = 0; i < count; i++) {
        points.push(candidates[i * stride] ?? candidates[candidates.length - 1])
    }

    // Also fill interior with random points inside heart
    // Use rejection sampling: fill fraction of count with interior points
    const interior = Math.floor(count * 0.55)
    let filled = 0
    let attempt = 0
    while (filled < interior && attempt < 50000) {
        attempt++
        const t = Math.random() * Math.PI * 2
        const r = Math.random()
        const hx = 16 * Math.pow(Math.sin(t), 3) * r
        const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * r
        // Only keep if inside heart shape (approximate: check radius relative to outline)
        const px = cx + hx * scale
        const py = cy + hy * scale
        // Validate inside heart by comparing distance to nearest outline point
        const dist2outline = Math.min(...candidates.map(c => (c.x - px) ** 2 + (c.y - py) ** 2))
        if (dist2outline < (scale * 3) ** 2) {
            points[count - interior + filled] = { x: px, y: py }
            filled++
        }
    }

    return points
}

export function useHeartParticles(
    canvasRef: Ref<HTMLCanvasElement | undefined>,
    isReduced: Ref<boolean>
): void {
    let rafId: number | null = null
    let particles: HeartParticle[] = []
    let canvasWidth = 0
    let canvasHeight = 0
    let isHovering = false
    let t = 0

    function buildParticles(): void {
        const cx = canvasWidth / 2
        const cy = canvasHeight / 2
        // Scale: heart formula spans ~32 wide x 21 tall — fit to ~70% of smaller dimension
        const scale = (Math.min(canvasWidth, canvasHeight) * 0.35) / 16

        const targets = generateHeartPoints(PARTICLE_COUNT, cx, cy, scale)
        particles = targets.map((target) => {
            // Start scattered randomly
            const startX = Math.random() * canvasWidth
            const startY = Math.random() * canvasHeight
            const hue = Math.random() < 0.7 ? 350 : (Math.random() < 0.5 ? 340 : 0)
            return {
                tx: target.x,
                ty: target.y,
                x: startX,
                y: startY,
                vx: 0,
                vy: 0,
                radius: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.4,
                hue,
                saturation: 60 + Math.random() * 15,
                lightness: 45 + Math.random() * 20,
                offsetAngle: Math.random() * Math.PI * 2,
                offsetRadius: Math.random() * FLOAT_AMPLITUDE,
                offsetSpeed: 0.3 + Math.random() * 0.7,
                phase: Math.random() * Math.PI * 2,
            }
        })
    }

    function resizeCanvas(): void {
        const canvas = canvasRef.value
        if (!canvas) return
        canvasWidth = canvas.offsetWidth
        canvasHeight = canvas.offsetHeight
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        buildParticles()
    }

    function scatterParticles(): void {
        for (const p of particles) {
            // Give each particle a burst velocity
            const angle = Math.random() * Math.PI * 2
            const speed = Math.random() * 5 + 2
            p.vx += Math.cos(angle) * speed
            p.vy += Math.sin(angle) * speed
        }
    }

    function drawFrame(): void {
        const canvas = canvasRef.value
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.clearRect(0, 0, canvasWidth, canvasHeight)
        t += 0.016

        for (const p of particles) {
            // Target with floating offset
            const floatX = p.tx + Math.cos(t * p.offsetSpeed + p.phase) * p.offsetRadius
            const floatY = p.ty + Math.sin(t * p.offsetSpeed * 0.7 + p.phase) * p.offsetRadius

            if (!isHovering) {
                // Spring toward floating target
                const dx = floatX - p.x
                const dy = floatY - p.y
                p.vx += dx * SPRING
                p.vy += dy * SPRING
            }
            // Always damp
            p.vx *= DAMPING
            p.vy *= DAMPING
            p.x += p.vx
            p.y += p.vy

            // Draw glow dot
            const grd = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5)
            grd.addColorStop(0, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, ${p.opacity})`)
            grd.addColorStop(1, `hsla(${p.hue}, ${p.saturation}%, ${p.lightness}%, 0)`)
            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2)
            ctx.fillStyle = grd
            ctx.fill()
        }

        rafId = requestAnimationFrame(drawFrame)
    }

    function onMouseEnter(): void {
        isHovering = true
        scatterParticles()
    }

    function onMouseLeave(): void {
        isHovering = false
    }

    onMounted(() => {
        const canvas = canvasRef.value
        if (!canvas || isReduced.value) return

        resizeCanvas()
        rafId = requestAnimationFrame(drawFrame)

        window.addEventListener('resize', resizeCanvas)
        canvas.addEventListener('mouseenter', onMouseEnter)
        canvas.addEventListener('mouseleave', onMouseLeave)
    })

    onUnmounted(() => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId)
            rafId = null
        }
        window.removeEventListener('resize', resizeCanvas)
        const canvas = canvasRef.value
        if (canvas) {
            canvas.removeEventListener('mouseenter', onMouseEnter)
            canvas.removeEventListener('mouseleave', onMouseLeave)
        }
    })
}
