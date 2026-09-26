import { useEffect, useRef } from 'react'

type Mote = {
  x: number
  y: number
  radius: number
  speed: number
  drift: number
  phase: number
  alpha: number
  ring: boolean
}

function starPath(context: CanvasRenderingContext2D, radius: number) {
  context.beginPath()
  for (let point = 0; point < 10; point += 1) {
    const angle = -Math.PI / 2 + point * Math.PI / 5
    const length = point % 2 === 0 ? radius : radius * 0.5
    const x = Math.cos(angle) * length
    const y = Math.sin(angle) * length
    if (point === 0) context.moveTo(x, y)
    else context.lineTo(x, y)
  }
  context.closePath()
}

export default function OceanBackdrop() {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvasElement = canvas.current
    if (!canvasElement) return

    const drawingContext = canvasElement.getContext('2d')
    if (!drawingContext) return

    const surface: HTMLCanvasElement = canvasElement
    const context: CanvasRenderingContext2D = drawingContext

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let frame = 0
    let last = performance.now()
    let elapsed = 0
    let pointerX = 0
    let pointerY = 0
    let targetX = 0
    let targetY = 0
    let paused = document.hidden
    let motionOff = reducedMotion.matches
    let motes: Mote[] = []

    function createMotes() {
      const count = Math.max(48, Math.min(110, Math.round((width * height) / 14000)))
      motes = Array.from({ length: count }, (_, index) => ({
        x: Math.random(),
        y: Math.random(),
        radius: 0.45 + Math.random() * 1.35,
        speed: 0.004 + Math.random() * 0.011,
        drift: 5 + Math.random() * 14,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.12 + Math.random() * 0.32,
        ring: index % 7 === 0,
      }))
    }

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const density = Math.min(window.devicePixelRatio || 1, 2)
      surface.width = Math.round(width * density)
      surface.height = Math.round(height * density)
      surface.style.width = `${width}px`
      surface.style.height = `${height}px`
      context.setTransform(density, 0, 0, density, 0, 0)
      createMotes()
      if (motionOff) render(performance.now())
    }

    function pointer(event: PointerEvent) {
      targetX = (event.clientX / Math.max(width, 1) - 0.5) * 2
      targetY = (event.clientY / Math.max(height, 1) - 0.5) * 2
    }

    function resetPointer() {
      targetX = 0
      targetY = 0
    }

    function render(now: number) {
      const delta = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!motionOff) elapsed += delta
      pointerX += (targetX - pointerX) * (motionOff ? 1 : 0.035)
      pointerY += (targetY - pointerY) * (motionOff ? 1 : 0.035)
      context.clearRect(0, 0, width, height)

      motes.forEach(mote => {
        const x = mote.x * width + Math.sin(elapsed * 0.38 + mote.phase) * mote.drift - pointerX * mote.drift * 0.45
        const y = ((mote.y - elapsed * mote.speed + 1) % 1) * height - pointerY * mote.drift * 0.25
        const shimmer = 0.65 + Math.sin(elapsed * 0.7 + mote.phase) * 0.25
        context.globalAlpha = mote.alpha * shimmer
        context.strokeStyle = '#bed9dc'
        context.fillStyle = '#dce8e6'
        context.lineWidth = 0.7
        context.beginPath()
        context.arc(x, y, mote.radius, 0, Math.PI * 2)
        if (mote.ring) context.stroke()
        else context.fill()
      })

      const isNarrow = width < 860
      const starX = isNarrow ? width * 0.76 : width * 0.72
      const starY = isNarrow
        ? Math.max(88, Math.min(height * 0.14, 116))
        : Math.max(86, Math.min(height * 0.2, 170))
      const bob = motionOff ? 0 : Math.sin(elapsed * 0.62) * 5
      context.save()
      context.translate(starX + pointerX * 9, starY + bob + pointerY * 5)
      context.rotate(-0.08 + pointerX * 0.035)
      context.globalAlpha = 1
      context.shadowColor = 'rgba(239, 211, 137, 0.48)'
      context.shadowBlur = 26
      context.fillStyle = '#ecd28b'
      starPath(context, width < 600 ? 27 : 34)
      context.fill()
      context.shadowBlur = 0
      context.strokeStyle = '#f5e2a9'
      context.lineWidth = 1
      context.stroke()
      context.fillStyle = '#493d2d'
      context.beginPath()
      context.ellipse(-4.6, 0, 1.35, 2.1, 0, 0, Math.PI * 2)
      context.ellipse(4.6, 0, 1.35, 2.1, 0, 0, Math.PI * 2)
      context.fill()
      context.restore()
      context.globalAlpha = 1

      if (!paused && !motionOff) frame = requestAnimationFrame(render)
    }

    function visibility() {
      paused = document.hidden
      cancelAnimationFrame(frame)
      if (!paused) {
        last = performance.now()
        frame = requestAnimationFrame(render)
      }
    }

    function preference() {
      motionOff = reducedMotion.matches
      cancelAnimationFrame(frame)
      last = performance.now()
      render(last)
    }

    resize()
    render(last)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', pointer, { passive: true })
    document.addEventListener('pointerleave', resetPointer)
    document.addEventListener('visibilitychange', visibility)
    reducedMotion.addEventListener('change', preference)

    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', pointer)
      document.removeEventListener('pointerleave', resetPointer)
      document.removeEventListener('visibilitychange', visibility)
      reducedMotion.removeEventListener('change', preference)
    }
  }, [])

  return <canvas ref={canvas} className="auth-ocean-canvas" aria-hidden="true" />
}
