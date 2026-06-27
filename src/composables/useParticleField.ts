// src/composables/useParticleField.ts
import { onMounted, onUnmounted } from 'vue'
import type { Ref } from 'vue'

interface Particle {
    x: number
    y: number
    vx: number
    vy: number
    radius: number
    opacity: number  // 0.3–0.7
    hue: number     // 350 (crimson) or 48 (ivory)
}

const PARTICLE_COUNT = 60

function createParticle(width: number, height: number): Particle {
    return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.4 + 0.3,  // 0.3–0.7
        hue: Math.random() < 0.5 ? 350 : 48,  // crimson or ivory
    }
}

/**
 * Manages a canvas-based particle field animation.
 * Runs a requestAnimationFrame loop that:
 * 1. Clears the canvas
 * 2. Updates particle positions (wrapping at canvas edges)
 * 3. Draws each particle as a radial gradient
 *
 * No DOM reads occur inside the RAF loop — dimensions are captured on mount/resize.
 * The canvas has pointer-events: none applied via the component.
 */
export function useParticleField(canvasRef: Ref<HTMLCanvasElement | undefined>): void {
    let rafId: number | null = null
    let particles: Particle[] = []
    let canvasWidth = 0
    let canvasHeight = 0

    function initParticles(): void {
        particles = Array.from({ length: PARTICLE_COUNT }, () =>
            createParticle(canvasWidth, canvasHeight)
        )
    }

    function resizeCanvas(): void {
        const canvas = canvasRef.value
        if (!canvas) return
        canvasWidth = canvas.offsetWidth
        canvasHeight = canvas.offsetHeight
        canvas.width = canvasWidth
        canvas.height = canvasHeight
        initParticles()
    }

    function drawFrame(): void {
        const canvas = canvasRef.value
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        // Clear
        ctx.clearRect(0, 0, canvasWidth, canvasHeight)

        for (const p of particles) {
            // Update position with edge wrapping
            p.x += p.vx
            p.y += p.vy
            if (p.x < 0) p.x += canvasWidth
            if (p.x > canvasWidth) p.x -= canvasWidth
            if (p.y < 0) p.y += canvasHeight
            if (p.y > canvasHeight) p.y -= canvasHeight

            // Draw radial gradient particle
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 3)
            const saturation = p.hue === 350 ? '65%' : '22%'
            const lightness = p.hue === 350 ? '55%' : '92%'
            gradient.addColorStop(0, `hsla(${p.hue}, ${saturation}, ${lightness}, ${p.opacity})`)
            gradient.addColorStop(1, `hsla(${p.hue}, ${saturation}, ${lightness}, 0)`)

            ctx.beginPath()
            ctx.arc(p.x, p.y, p.radius * 3, 0, Math.PI * 2)
            ctx.fillStyle = gradient
            ctx.fill()
        }

        rafId = requestAnimationFrame(drawFrame)
    }

    onMounted(() => {
        resizeCanvas()
        rafId = requestAnimationFrame(drawFrame)
        window.addEventListener('resize', resizeCanvas)
    })

    onUnmounted(() => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId)
            rafId = null
        }
        window.removeEventListener('resize', resizeCanvas)
    })
}
