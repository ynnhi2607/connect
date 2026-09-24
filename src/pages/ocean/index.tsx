import { type RefObject, useEffect, useRef } from 'react'
import { ArrowDown, ArrowRight, Sparkles } from 'lucide-react'
import './ocean.css'

type Particle = { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; kind: number }
type OceanMotion = { progress: number; starY: number; driftScale: number }
const clamp = (value: number) => Math.max(0, Math.min(value, 1))
const SINK_DISTANCE = 0.12
const entryTravel = (height: number, scale: number) => Math.min(120, height * 0.13) * Math.sqrt(scale)

function starPath(ctx: CanvasRenderingContext2D, radius: number) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const angle = -Math.PI / 2 + i * Math.PI / 5
    const r = i % 2 === 0 ? radius : radius * 0.51
    return { x: Math.cos(angle) * r, y: Math.sin(angle) * r }
  })
  ctx.beginPath()
  const last = points[9]
  ctx.moveTo((last.x + points[0].x) / 2, (last.y + points[0].y) / 2)
  points.forEach((p, i) => {
    const next = points[(i + 1) % points.length]
    ctx.quadraticCurveTo(p.x, p.y, (p.x + next.x) / 2, (p.y + next.y) / 2)
  })
  ctx.closePath()
}

function OceanScene({ motion }: { motion: RefObject<OceanMotion> }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const target = useRef<HTMLButtonElement>(null)
  const burst = useRef<() => void>(() => {})

  useEffect(() => {
    const surface = canvas.current
    const button = target.current
    const ctx = surface?.getContext('2d')
    if (!surface || !ctx || !button) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0, height = 0, frame = 0, time = 0, last = 0, spawn = 0, glow = 0
    let x = window.innerWidth / 2, y = window.innerHeight * 0.35
    let velocityX = 0, velocityY = 0, lean = 0
    let pointerX = 0, pointerY = 0, motionOff = reduced.matches
    let particles: Particle[] = []
    const dust = Array.from({ length: 90 }, () => ({ x: Math.random(), y: Math.random(), r: Math.random() * 1.1 + 0.3, phase: Math.random() * 6.28 }))

    function resize() {
      width = window.innerWidth
      height = window.innerHeight
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      surface!.width = Math.round(width * dpr)
      surface!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    function move(event: PointerEvent) {
      pointerX = (event.clientX / width - 0.5) * 2
      pointerY = (event.clientY / height - 0.5) * 2
    }
    function reset() { pointerX = 0; pointerY = 0 }
    function onScroll() { if (motionOff) render(performance.now()) }
    function addParticle(burstParticle = false, originX = x, originY = y) {
      const roll = Math.random()
      const kind = burstParticle ? 2 : roll < 0.4 ? 1 : roll < 0.72 ? 2 : 0
      const life = 3 + Math.random() * 3
      particles.push({
        x: originX + (Math.random() - 0.5) * (kind === 1 ? 28 : 18),
        y: originY - (kind === 1 ? 16 : Math.sign(velocityY || 1) * 17),
        vx: velocityX * 0.12 + (Math.random() - 0.5) * (burstParticle ? 65 : 12),
        vy: kind === 1 ? -24 - Math.random() * 26 : -10 - Math.random() * 14 - velocityY * 0.12,
        life, max: life,
        size: burstParticle ? 3 + Math.random() * 4 : kind === 1 ? 1.5 + Math.random() * 2 : kind === 2 ? 1.2 + Math.random() * 1.8 : 0.6 + Math.random(),
        kind,
      })
      if (particles.length > 260) particles.shift()
    }
    burst.current = () => {
      if (motionOff) return
      glow = 1
      for (let i = 0; i < 16; i++) addParticle(true)
    }

    function render(now: number) {
      const dt = Math.min((now - last) / 1000 || 0, 0.04)
      last = now
      const still = motionOff
      if (!still) time += dt
      const depth = motion.current.progress
      const travel = entryTravel(height, motion.current.driftScale)
      const desiredX = width / 2 + (still ? 0 : Math.sin(depth * Math.PI) * 42 + Math.sin(time * 0.45) * 15 + pointerX * 20)
      const desiredY = motion.current.starY + (still ? 0 : -(1 - depth) * travel + (depth * height * SINK_DISTANCE + 24 * (1 - Math.exp(-time / 18)) + Math.sin(time * 0.6) * 7 + pointerY * 7) * motion.current.driftScale)
      const previousX = x, previousY = y
      x += (desiredX - x) * (still ? 1 : 1 - Math.exp(-dt * 5))
      y += (desiredY - y) * (still ? 1 : 1 - Math.exp(-dt * 5))
      x = Math.max(44, Math.min(width - 44, x))
      y = Math.min(y, motion.current.starY + (height * SINK_DISTANCE + 38) * motion.current.driftScale)
      velocityX = dt > 0 && !still ? (x - previousX) / dt : 0
      velocityY = dt > 0 && !still ? (y - previousY) / dt : 0
      const speed = Math.min(1, Math.hypot(velocityX, velocityY) / 140)
      lean += ((velocityX * 0.003 + Math.sin(time * 0.6) * 0.08 + pointerX * 0.08) - lean) * (1 - Math.exp(-dt * 4))
      button!.style.transform = `translate3d(${x - 44}px, ${y - 44}px, 0)`
      ctx!.clearRect(0, 0, width, height)

      dust.forEach(p => {
        const px = (p.x * width + Math.sin(time * 0.1 + p.phase) * 10 - pointerX * p.r * 5 + width) % width
        const py = ((p.y * height - time * p.r * 5 - depth * p.r * 80) % height + height) % height
        ctx!.fillStyle = `rgba(188,222,225,${(0.12 + 0.13 * Math.sin(time * 0.5 + p.phase) ** 2) * (1 - depth * 0.6)})`
        ctx!.beginPath(); ctx!.arc(px, py, p.r, 0, Math.PI * 2); ctx!.fill()
      })

      if (!still) {
        spawn += dt * (22 + speed * 44)
        const count = Math.floor(spawn)
        spawn -= count
        // Emit along the travelled segment so quick descents leave an unbroken wake.
        for (let i = 0; i < count; i++) {
          const fraction = (i + 1) / count
          addParticle(false, previousX + (x - previousX) * fraction, previousY + (y - previousY) * fraction)
        }
        glow = Math.max(0, glow - dt * 0.7)
      }
      particles = particles.filter(p => p.life > 0)
      particles.forEach(p => {
        if (!still) { p.life -= dt; p.x += (p.vx + Math.sin(time + p.y * 0.01) * 4) * dt; p.y += p.vy * dt }
        const alpha = Math.max(0, p.life / p.max)
        ctx!.save(); ctx!.translate(p.x, p.y); ctx!.globalAlpha = Math.min(1, (p.max - p.life) / 0.15) * alpha * (p.kind === 2 ? 0.9 : 0.65)
        ctx!.fillStyle = p.kind === 2 ? '#f9d989' : '#d6edf0'
        ctx!.strokeStyle = '#b8dfe3'; ctx!.lineWidth = 0.7
        if (p.kind === 2) { ctx!.rotate(p.life * 0.45); starPath(ctx!, p.size * (0.4 + alpha) * 1.7); ctx!.fill() }
        else {
          const radius = p.size * (0.3 + alpha * 0.7)
          ctx!.beginPath(); ctx!.arc(0, 0, radius, 0, Math.PI * 2)
          if (p.kind === 1) {
            ctx!.stroke()
            ctx!.beginPath(); ctx!.arc(-radius * 0.3, -radius * 0.35, 0.45, 0, Math.PI * 2); ctx!.fill()
          } else ctx!.fill()
        }
        ctx!.restore()
      })

      ctx!.save(); ctx!.translate(x, y); ctx!.rotate(still ? -0.08 : lean)
      ctx!.shadowColor = `rgba(255,218,112,${0.35 + glow * 0.4})`; ctx!.shadowBlur = 22 + glow * 20
      const fill = ctx!.createLinearGradient(-20, -35, 20, 35)
      fill.addColorStop(0, '#fff1b0'); fill.addColorStop(0.55, '#f7d97b'); fill.addColorStop(1, '#dfb75b')
      ctx!.fillStyle = fill; starPath(ctx!, width < 600 ? 34 : 41); ctx!.fill()
      ctx!.shadowBlur = 0; ctx!.strokeStyle = '#ffe7a4'; ctx!.lineWidth = 1; ctx!.stroke()
      ctx!.fillStyle = '#4d3c28'
      ctx!.beginPath(); ctx!.ellipse(-5.5, 0, 1.6, 2.5, 0, 0, Math.PI * 2); ctx!.ellipse(5.5, 0, 1.6, 2.5, 0, 0, Math.PI * 2); ctx!.fill()
      ctx!.beginPath(); ctx!.ellipse(0, 8, 1.7, 1.1, 0, 0, Math.PI * 2); ctx!.fill()
      ctx!.restore()
      if (!still) frame = requestAnimationFrame(render)
    }
    function preference() { motionOff = reduced.matches; cancelAnimationFrame(frame); last = 0; render(performance.now()) }
    function visibility() { cancelAnimationFrame(frame); if (!document.hidden) { last = 0; render(performance.now()) } }
    function resized() { resize(); if (motionOff) render(performance.now()) }
    resize()
    y = motion.current.starY - (motionOff ? 0 : (1 - motion.current.progress) * entryTravel(height, motion.current.driftScale))
    // Pre-populate the wake so the first frame already communicates descent.
    for (let i = 0; i < 65; i++) { addParticle(); const p = particles[particles.length - 1]; p.y -= Math.random() * height * 0.36; p.x += Math.sin(p.y * 0.02) * 15; p.life *= Math.random() * 0.7 + 0.3 }
    render(performance.now())
    window.addEventListener('resize', resized)
    window.addEventListener('pointermove', move, { passive: true })
    document.addEventListener('pointerleave', reset)
    window.addEventListener('ocean-layout', onScroll)
    document.addEventListener('visibilitychange', visibility)
    reduced.addEventListener('change', preference)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resized)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', reset)
      window.removeEventListener('ocean-layout', onScroll)
      document.removeEventListener('visibilitychange', visibility)
      reduced.removeEventListener('change', preference)
      burst.current = () => {}
    }
  }, [motion])

  return <div className="ocean-scene">
    <canvas ref={canvas} aria-hidden="true" />
    <button ref={target} className="ocean-star-target" aria-label="Send a little light" title="Send a little light" onPointerEnter={() => burst.current()} onClick={() => burst.current()} />
  </div>
}

export default function OceanPage() {
  const page = useRef<HTMLElement>(null)
  const depthLabel = useRef<HTMLSpanElement>(null)
  const motion = useRef<OceanMotion>({ progress: 0, starY: 200, driftScale: 1 })

  useEffect(() => {
    const container = page.current!
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame = 0, transitioning = false, targetScene = window.scrollY > 0 ? 1 : 0
    let lastWheel = 0, wheelTotal = 0, wheelConsumed = false
    let touchX = 0, touchY = 0, touchActive = false, touchConsumed = false
    const destination = (index: number) => index === 0 ? 0 : container.querySelector<HTMLElement>('#journey')!.offsetTop

    function navigate(index: number) {
      if (transitioning) return
      targetScene = index
      const from = window.scrollY
      const to = destination(index)
      if (Math.abs(from - to) < 1) return
      transitioning = true
      const started = performance.now()
      const tick = (now: number) => {
        const p = reduced.matches ? 1 : clamp((now - started) / 1050)
        // Zero velocity and acceleration at both ends avoid an abrupt start/stop.
        const ease = p * p * p * (10 + p * (-15 + p * 6))
        window.scrollTo({ top: from + (to - from) * ease, behavior: 'instant' })
        if (p < 1) frame = requestAnimationFrame(tick)
        else { transitioning = false; frame = 0 }
      }
      frame = requestAnimationFrame(tick)
    }
    function canReadMore(target: EventTarget | null, direction: number) {
      const copy = target instanceof Element ? target.closest<HTMLElement>('.ocean-copy') : null
      return !!copy && copy.scrollHeight > copy.clientHeight + 1 && (direction > 0
        ? copy.scrollTop + copy.clientHeight < copy.scrollHeight - 1 : copy.scrollTop > 1)
    }
    function wheel(event: WheelEvent) {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return
      if (!transitioning && canReadMore(event.target, event.deltaY)) return
      event.preventDefault()
      const now = performance.now()
      if (now - lastWheel > 220) { wheelTotal = 0; wheelConsumed = false }
      lastWheel = now
      if (transitioning || wheelConsumed) { wheelConsumed = true; return }
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1)
      if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0
      wheelTotal += delta
      if (Math.abs(wheelTotal) >= 24) {
        wheelConsumed = true
        navigate(wheelTotal > 0 ? 1 : 0)
      }
    }
    function touchStart(event: TouchEvent) {
      touchActive = event.touches.length === 1
      touchConsumed = transitioning
      if (touchActive) { touchX = event.touches[0].clientX; touchY = event.touches[0].clientY }
    }
    function touchMove(event: TouchEvent) {
      if (!touchActive || event.touches.length !== 1) return
      const dy = touchY - event.touches[0].clientY
      const dx = touchX - event.touches[0].clientX
      if (Math.abs(dx) > Math.abs(dy)) return
      if (!transitioning && !touchConsumed && canReadMore(event.target, dy)) return
      event.preventDefault()
      if (transitioning || touchConsumed || Math.abs(dy) < 36) return
      touchConsumed = true
      navigate(dy > 0 ? 1 : 0)
    }
    function touchEnd() { touchActive = false }
    function key(event: KeyboardEvent) {
      if (event.altKey || event.ctrlKey || event.metaKey || (event.target instanceof Element && event.target.closest('input, textarea, select, [contenteditable="true"]'))) return
      const down = ['ArrowDown', 'PageDown', 'End'].includes(event.key) || (event.key === ' ' && !event.shiftKey)
      const up = ['ArrowUp', 'PageUp', 'Home'].includes(event.key) || (event.key === ' ' && event.shiftKey)
      if (!down && !up) return
      if (event.key === ' ' && event.target instanceof Element && event.target.closest('button, a')) return
      if (canReadMore(event.target, down ? 1 : -1)) return
      event.preventDefault()
      if (!event.repeat) navigate(down ? 1 : 0)
    }
    function resize() {
      cancelAnimationFrame(frame)
      transitioning = false
      frame = requestAnimationFrame(() => window.scrollTo({ top: destination(targetScene), behavior: 'instant' }))
    }
    function syncScene() {
      if (!transitioning) targetScene = window.scrollY >= destination(1) / 2 ? 1 : 0
    }
    window.addEventListener('wheel', wheel, { passive: false })
    container.addEventListener('touchstart', touchStart, { passive: true })
    container.addEventListener('touchmove', touchMove, { passive: false })
    container.addEventListener('touchend', touchEnd)
    container.addEventListener('touchcancel', touchEnd)
    window.addEventListener('keydown', key)
    window.addEventListener('resize', resize)
    window.addEventListener('scroll', syncScene, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('wheel', wheel)
      container.removeEventListener('touchstart', touchStart)
      container.removeEventListener('touchmove', touchMove)
      container.removeEventListener('touchend', touchEnd)
      container.removeEventListener('touchcancel', touchEnd)
      window.removeEventListener('keydown', key)
      window.removeEventListener('resize', resize)
      window.removeEventListener('scroll', syncScene)
    }
  }, [])

  useEffect(() => {
    const oldTitle = document.title
    document.title = 'ConnectSpace | Beneath the quiet'
    const root = document.documentElement
    const container = page.current!
    const sections = Array.from(container.querySelectorAll<HTMLElement>('.ocean-panel'))
    const copies = Array.from(container.querySelectorAll<HTMLElement>('.ocean-copy'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    let safeBottom = 0
    let expanded = false
    let keyboard = false
    let disposed = false
    root.classList.add('ocean-scroll')

    const update = () => {
      const distance = sections[1].offsetTop - sections[0].offsetTop
      const progress = clamp(window.scrollY / Math.max(distance, 1))
      motion.current.progress = progress
      container.style.setProperty('--depth', String(progress))
      if (depthLabel.current) depthLabel.current.textContent = `${Math.round(progress * 1200).toLocaleString()} m`
      copies.forEach((copy, index) => {
        const rect = copy.getBoundingClientRect()
        const separation = clamp((rect.top - safeBottom) / 48)
        const entrance = index === 0 ? 1 : clamp((progress - 0.55) / 0.25)
        const opacity = Math.min(separation, entrance)
        copy.style.opacity = String(opacity)
        copy.inert = opacity === 0
        copy.setAttribute('aria-hidden', String(opacity === 0))
      })
      window.dispatchEvent(new Event('ocean-layout'))
    }
    const measure = () => {
      if (disposed) return
      const height = window.innerHeight
      motion.current.starY = Math.max(110, height * 0.25)
      // Reserve the complete motion envelope, hit target and a 24px visual gap.
      safeBottom = motion.current.starY + height * SINK_DISTANCE + 38 + 44 + 24
      const footerHeight = container.querySelector('footer')!.getBoundingClientRect().height
      container.style.setProperty('--footer-height', `${footerHeight}px`)
      const requiredHeight = Math.max(copies[0].scrollHeight + 112, copies[1].scrollHeight + footerHeight)
      expanded = safeBottom + 48 + requiredHeight > height + 1
      motion.current.driftScale = expanded ? 0.5 : 1
      if (expanded) {
        motion.current.starY = Math.max(110, Math.min(160, height * 0.2))
        safeBottom = motion.current.starY + (height * SINK_DISTANCE + 38) * motion.current.driftScale + 44 + 24
      }
      container.style.setProperty('--safe-top', `${safeBottom + 48}px`)
      root.classList.toggle('ocean-scroll-expanded', expanded)
      update()
    }
    const focusScene = (event: FocusEvent) => {
      if (!keyboard || !(event.target instanceof HTMLElement)) return
      const section = event.target.closest<HTMLElement>('.ocean-panel')
      if (!section) return
      if (!expanded) section.scrollIntoView({ behavior: 'instant', block: 'start' })
      update()
    }
    const onKey = () => { keyboard = true }
    const onPointer = () => { keyboard = false }
    const observer = new ResizeObserver(measure)
    copies.forEach(copy => observer.observe(copy))
    observer.observe(container.querySelector('footer')!)
    measure()
    void document.fonts.ready.then(measure)
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', measure)
    container.addEventListener('focusin', focusScene)
    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    reduced.addEventListener('change', measure)
    return () => {
      disposed = true
      document.title = oldTitle
      observer.disconnect()
      root.classList.remove('ocean-scroll', 'ocean-scroll-expanded')
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', measure)
      container.removeEventListener('focusin', focusScene)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      reduced.removeEventListener('change', measure)
    }
  }, [])

  return <main className="ocean-page" ref={page}>
    <a className="ocean-skip" href="#journey">Skip to content</a>
    <div className="ocean-backdrop" aria-hidden="true" />
    <OceanScene motion={motion} />
    <header className="ocean-header">
      <a className="ocean-wordmark" href="/" aria-label="ConnectSpace home"><Sparkles size={18} strokeWidth={1.3} /> ConnectSpace</a>
    </header>
    <section id="surface" className="ocean-panel ocean-hero" aria-labelledby="ocean-title" tabIndex={-1}>
      <div className="ocean-copy ocean-hero-copy">
        <p className="ocean-eyebrow">A LITTLE LIGHT. A DEEPER CONNECTION.</p>
        <h1 id="ocean-title">Find the light<br /><em>beneath the quiet.</em></h1>
        <p className="ocean-description">Even in the deepest blue,<br className="ocean-mobile-break" /> you don't have to drift alone.</p>
      </div>
      <div className="ocean-descent" aria-hidden="true"><span>THERE'S MORE BELOW</span><ArrowDown size={15} strokeWidth={1.5} /><span className="ocean-descent-line" /></div>
    </section>
    <section id="journey" className="ocean-panel ocean-journey" aria-labelledby="journey-title" tabIndex={-1}>
      <div className="ocean-copy ocean-journey-copy">
        <p className="ocean-eyebrow">SOME CONNECTIONS RUN DEEP</p>
        <h2 id="journey-title">A small light.<br /><em>A place to belong.</em></h2>
        <p className="ocean-description">For the thoughts you keep close.<br />For the people who understand.</p>
        <a className="ocean-cta" href="/auth">Find your connection <ArrowRight size={15} strokeWidth={1.5} /></a>
      </div>
      <footer className="ocean-footer"><span>A little less alone.</span><span>ConnectSpace</span></footer>
    </section>
    <aside className="ocean-depth" aria-label="Ocean depth"><span className="ocean-depth-track"><span /></span><span ref={depthLabel}>0 m</span></aside>
  </main>
}
