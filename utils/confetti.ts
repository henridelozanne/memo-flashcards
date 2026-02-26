const COLORS = [
  '#f43f5e',
  '#f97316',
  '#facc15',
  '#4ade80',
  '#22d3ee',
  '#818cf8',
  '#e879f9',
  '#fb7185',
  '#34d399',
  '#60a5fa',
]

const TOTAL = 180
const DURATION = 6000

interface Particle {
  x: number
  y: number
  w: number
  h: number
  color: string
  angle: number
  angularVel: number
  vx: number
  vy: number
  opacity: number
  shape: 'rect' | 'circle' | 'ribbon'
  phase: number
  phaseSpeed: number
}

function createParticle(canvasWidth: number, index: number, canvasHeight: number): Particle {
  const shape = (['rect', 'rect', 'circle', 'ribbon'] as const)[Math.floor(Math.random() * 4)]
  return {
    x: Math.random() * canvasWidth,
    y: -(index * (canvasHeight / TOTAL) * 1.4),
    w: shape === 'ribbon' ? 4 + Math.random() * 3 : 7 + Math.random() * 7,
    h: shape === 'ribbon' ? 14 + Math.random() * 10 : 7 + Math.random() * 7,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    angle: Math.random() * Math.PI * 2,
    angularVel: (Math.random() - 0.5) * 0.18,
    vx: (Math.random() - 0.5) * 1.5,
    vy: 2.5 + Math.random() * 3.5,
    opacity: 0.85 + Math.random() * 0.15,
    shape,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.03 + Math.random() * 0.04,
  }
}

function updateParticle(p: Particle, canvasHeight: number): Particle {
  const nextPhase = p.phase + p.phaseSpeed
  const nextVy = p.vy + 0.12
  const nextVx = p.vx * 0.995
  const nextY = p.y + nextVy
  return {
    ...p,
    phase: nextPhase,
    vx: nextVx,
    vy: nextVy,
    x: p.x + nextVx + Math.sin(nextPhase) * 0.6,
    y: nextY,
    angle: p.angle + p.angularVel,
    opacity: nextY > canvasHeight * 0.75 ? Math.max(0, p.opacity - 0.03) : p.opacity,
  }
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle): void {
  if (p.opacity <= 0) return
  ctx.save()
  ctx.globalAlpha = p.opacity
  ctx.translate(p.x, p.y)
  ctx.rotate(p.angle)
  ctx.fillStyle = p.color
  if (p.shape === 'circle') {
    ctx.beginPath()
    ctx.ellipse(0, 0, p.w / 2, p.h / 3, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (p.shape === 'ribbon') {
    ctx.scale(Math.abs(Math.cos(p.angle * 2)) + 0.15, 1)
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
  } else {
    ctx.scale(Math.abs(Math.cos(p.angle)) + 0.15, 1)
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
  }
  ctx.restore()
}

function setupResizeHandler(canvas: HTMLCanvasElement): () => void {
  const resize = () => Object.assign(canvas, { width: window.innerWidth, height: window.innerHeight })
  resize()
  window.addEventListener('resize', resize)
  return () => window.removeEventListener('resize', resize)
}

function runAnimation(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): () => void {
  const startTime = performance.now()
  let particles: Particle[] = Array.from({ length: TOTAL }, (_, i) => createParticle(canvas.width, i, canvas.height))
  let rafId: number | null = null
  let active = true

  function draw() {
    if (!active) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    particles = particles.map((p) => updateParticle(p, canvas.height))
    particles.forEach((p) => drawParticle(ctx, p))
    const elapsed = performance.now() - startTime
    const allGone = particles.every((p) => p.y >= canvas.height + 20 || p.opacity <= 0)
    if (elapsed < DURATION || !allGone) {
      rafId = requestAnimationFrame(draw)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  rafId = requestAnimationFrame(draw)
  return () => {
    active = false
    if (rafId !== null) cancelAnimationFrame(rafId)
  }
}

/**
 * Launches a confetti animation on the given canvas element.
 * Returns a cleanup function that stops the animation and removes event listeners.
 */
export function launchConfetti(canvas: HTMLCanvasElement): (() => void) | null {
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const cleanupResize = setupResizeHandler(canvas)
  const cleanupAnim = runAnimation(canvas, ctx)
  return () => {
    cleanupResize()
    cleanupAnim()
  }
}
