import { useEffect, useRef } from 'react'

const lerp = (a, b, t) => a + (b - a) * t

const clamp = (value, min, max) => Math.max(min, Math.min(max, value))

export default function CursorOrb() {
  const orbRef = useRef(null)
  const targetX = useRef(window.innerWidth / 2)
  const targetY = useRef(window.innerHeight / 2)
  const currentX = useRef(window.innerWidth / 2)
  const currentY = useRef(window.innerHeight / 2)
  const scale = useRef(1)
  const animationFrame = useRef(null)
  const isPointerInside = useRef(false)

  useEffect(() => {
    const orb = orbRef.current
    if (!orb) return

    const onMove = (event) => {
      targetX.current = event.clientX
      targetY.current = event.clientY
      isPointerInside.current = true
    }

    const onLeave = () => {
      isPointerInside.current = false
    }

    const onDown = () => {
      scale.current = 0.86
    }

    const onUp = () => {
      scale.current = 1
    }

    const animate = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      currentX.current = lerp(currentX.current, targetX.current, 0.18)
      currentY.current = lerp(currentY.current, targetY.current, 0.18)
      const x = currentX.current
      const y = currentY.current
      const minEdge = Math.min(x, y, width - x, height - y)
      const edgeFade = clamp(minEdge / 140, 0.28, 1)
      const finalScale = lerp(Number(orb.dataset.scale || 1), scale.current, 0.14)
      orb.dataset.scale = String(finalScale)

      orb.style.transform = `translate3d(${x - 24}px, ${y - 24}px, 0) scale(${finalScale})`
      orb.style.opacity = isPointerInside.current ? String(edgeFade) : '0'
      animationFrame.current = requestAnimationFrame(animate)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })

    animationFrame.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      cancelAnimationFrame(animationFrame.current)
    }
  }, [])

  return (
    <div
      ref={orbRef}
      data-scale="1"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: 48,
        height: 48,
        borderRadius: '50%',
        pointerEvents: 'none',
        transform: 'translate3d(-50%, -50%, 0)',
        willChange: 'transform, opacity',
        background: 'radial-gradient(circle at 35% 35%, rgba(255, 255, 255, 0.98) 5%, #FFD700 22%, #FF69B4 50%, #9B59B6 85%)',
        boxShadow: '0 0 24px rgba(255, 105, 180, 0.24), 0 0 70px rgba(255, 215, 0, 0.12), inset 0 0 24px rgba(255,255,255,0.18)',
        filter: 'blur(0.6px)',
        opacity: 0,
        zIndex: 999,
        mixBlendMode: 'screen'
      }}
    />
  )
}
