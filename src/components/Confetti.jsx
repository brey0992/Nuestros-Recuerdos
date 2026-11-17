import { createContext, useCallback, useContext, useEffect, useRef } from 'react'

const ConfettiCtx = createContext(() => {})
export const useConfetti = () => useContext(ConfettiCtx)

const COLORS = ['#fa7864', '#dc8264', '#ffffff', '#000000', '#ffd7c9']
const LIFE = 160

/** Un solo canvas para todo el confeti; solo anima mientras hay piezas en el aire. */
export function ConfettiLayer({ children }) {
  const canvas = useRef(null)
  const parts = useRef([])
  const raf = useRef(0)

  useEffect(() => {
    const fit = () => {
      const cv = canvas.current
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      cv.width = innerWidth * dpr
      cv.height = innerHeight * dpr
      cv.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    fit()
    window.addEventListener('resize', fit)
    return () => { window.removeEventListener('resize', fit); cancelAnimationFrame(raf.current) }
  }, [])

  const loop = useCallback(() => {
    const g = canvas.current.getContext('2d')
    g.clearRect(0, 0, innerWidth, innerHeight)
    const alive = []
    for (const p of parts.current) {
      p.vy += 0.22; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++
      if (p.life > LIFE || p.y > innerHeight + 40) continue
      alive.push(p)
      g.save()
      g.translate(p.x, p.y); g.rotate(p.rot)
      g.globalAlpha = 1 - p.life / LIFE
      g.fillStyle = p.c
      if (p.heart) { g.font = `${p.r * 4}px serif`; g.fillText('♥', -p.r, p.r) } else g.fillRect(-p.r, -p.r / 2, p.r * 2, p.r)
      g.restore()
    }
    parts.current = alive
    raf.current = alive.length ? requestAnimationFrame(loop) : 0
  }, [])

  const burst = useCallback((x = innerWidth / 2, y = innerHeight / 2, n = 90) => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2
      const v = 4 + Math.random() * 8
      parts.current.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 6, r: 3 + Math.random() * 5,
        c: COLORS[i % COLORS.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, life: 0, heart: i % 7 === 0,
      })
    }
    if (!raf.current) raf.current = requestAnimationFrame(loop)
  }, [loop])

  return (
    <ConfettiCtx.Provider value={burst}>
      {children}
      <canvas ref={canvas} className="confetti" aria-hidden="true" />
    </ConfettiCtx.Provider>
  )
}
