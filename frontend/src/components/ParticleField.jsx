import { useEffect, useRef } from 'react'

const COLORS = ['#FF69B4', '#FFD700', '#9B59B6']

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

const createParticles = (width, height) => {
  const particles = []
  for (let i = 0; i < 80; i += 1) {
    particles.push({
      homeX: Math.random() * width,
      homeY: Math.random() * height,
      x: 0,
      y: 0,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: 3 + Math.random() * 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      opacity: 0.4 + Math.random() * 0.4,
    })
  }
  return particles.map((particle) => ({ ...particle, x: particle.homeX, y: particle.homeY }))
}

export default function ParticleField() {
  const canvasRef = useRef(null)
  const particlesRef = useRef([])
  const cursorRef = useRef({ x: 0, y: 0, active: false })
  const frameRef = useRef(null)
  const sizeRef = useRef({ width: window.innerWidth, height: window.innerHeight })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    const resizeCanvas = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      sizeRef.current = { width, height }
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (!particlesRef.current.length) {
        particlesRef.current = createParticles(width, height)
      }
    }

    const onPointerMove = (event) => {
      cursorRef.current.x = event.clientX
      cursorRef.current.y = event.clientY
      cursorRef.current.active = true
    }

    const onPointerLeave = () => {
      cursorRef.current.active = false
    }

    const animate = () => {
      const { width, height } = sizeRef.current
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      const cursorX = cursorRef.current.x
      const cursorY = cursorRef.current.y
      const cursorActive = cursorRef.current.active

      particlesRef.current.forEach((particle) => {
        const homeDx = particle.homeX - particle.x
        const homeDy = particle.homeY - particle.y
        const homeForceX = homeDx * 0.05
        const homeForceY = homeDy * 0.05

        let repelX = 0
        let repelY = 0
        if (cursorActive) {
          const dx = particle.x - cursorX
          const dy = particle.y - cursorY
          const distance = Math.sqrt(dx * dx + dy * dy)
          if (distance > 0 && distance < 120) {
            const power = ((120 - distance) / 120) * 0.3
            repelX = (dx / distance) * power
            repelY = (dy / distance) * power
          }
        }

        particle.vx = (particle.vx + homeForceX + repelX + (Math.random() - 0.5) * 0.04) * 0.85
        particle.vy = (particle.vy + homeForceY + repelY + (Math.random() - 0.5) * 0.04) * 0.85
        particle.x += particle.vx
        particle.y += particle.vy

        particle.x = clamp(particle.x, 0, width)
        particle.y = clamp(particle.y, 0, height)

        ctx.beginPath()
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.globalAlpha = 1
      frameRef.current = requestAnimationFrame(animate)
    }

    resizeCanvas()
    frameRef.current = requestAnimationFrame(animate)

    window.addEventListener('resize', resizeCanvas)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })

    return () => {
      cancelAnimationFrame(frameRef.current)
      window.removeEventListener('resize', resizeCanvas)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9,
      }}
    />
  )
}
