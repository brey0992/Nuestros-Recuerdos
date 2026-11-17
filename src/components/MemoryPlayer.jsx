import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion } from 'framer-motion'
import { chapters } from '../data.js'
import { music } from '../lib/music.js'
import { soft, useModal, useMusic } from '../lib/hooks.js'
import { useConfetti } from './Confetti.jsx'
import { PitufoDrops } from './Gallery.jsx'
import { LetterTitle, Pill } from './ui.jsx'

const DURATION = 4800 // ms por diapositiva

// La secuencia se arma una sola vez: portada, y por capítulo su tarjeta + sus fotos.
const SLIDES = [
  { type: 'title' },
  ...chapters.flatMap((c) => [
    { type: 'chapter', c },
    ...c.photos.map((p, k) => ({ type: 'photo', p, line: k === 2 ? c.lines[0] : k === 5 ? c.lines[1] : null })),
  ]),
  { type: 'end' },
]
const LAST = SLIDES.length - 1

// 4 recorridos de cámara lenta (efecto Ken Burns) que se van alternando
const KEN_BURNS = [
  [{ scale: 1.18, x: '-3%', y: '-2%' }, { scale: 1.04, x: '2%', y: '1%' }],
  [{ scale: 1.05, x: '2%', y: '2%' }, { scale: 1.2, x: '-2%', y: '-2%' }],
  [{ scale: 1.2, x: '3%', y: '-1%' }, { scale: 1.05, x: '-2%', y: '2%' }],
  [{ scale: 1.06, x: '-2%', y: '3%' }, { scale: 1.18, x: '2%', y: '-2%' }],
]

/** Modo recuerdo a pantalla completa, como "Recuerdos" del iPhone. */
export function MemoryPlayer({ onClose }) {
  const reduce = useReducedMotion()
  const burst = useConfetti()
  const musicOn = useMusic()
  const [i, setI] = useState(0)
  const [paused, setPaused] = useState(false)
  // el avance de la barra vive fuera de React: no re-renderiza el reproductor 60 veces por segundo
  const progress = useMotionValue(0)
  const s = SLIDES[i]

  const goTo = useCallback((n) => { progress.set(0); setI(Math.max(0, Math.min(LAST, n))) }, [progress])

  useEffect(() => {
    if (paused || i === LAST) return
    let raf, last = performance.now()
    const tick = (t) => {
      const v = progress.get() + (t - last) / DURATION
      last = t
      if (v >= 1) { goTo(i + 1); return }
      progress.set(v)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [i, paused, progress, goTo])

  // precarga la foto siguiente
  useEffect(() => { const n = SLIDES[i + 1]; if (n?.type === 'photo') new Image().src = n.p.lg }, [i])
  useEffect(() => { if (s.type === 'end') { const t = setTimeout(() => burst(innerWidth / 2, innerHeight * 0.45, 140), 500); return () => clearTimeout(t) } }, [s.type, burst])

  useModal(useCallback((e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowRight') goTo(i + 1)
    else if (e.key === 'ArrowLeft') goTo(i - 1)
    else if (e.key === ' ') { e.preventDefault(); setPaused((v) => !v) }
  }, [i, goTo, onClose]))

  const hold = { onPointerDown: () => setPaused(true), onPointerUp: () => setPaused(false), onPointerLeave: () => setPaused(false) }
  const [kbFrom, kbTo] = KEN_BURNS[i % 4]

  return (
    <motion.div className="memory" role="dialog" aria-modal="true" aria-label="Recuerdo"
      initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} transition={{ duration: 0.45 }}>
      <div className="memory__bars" aria-hidden="true">
        {SLIDES.map((_, k) => (
          <span key={k} className="bar">
            {k === i ? <motion.span className="bar__fill" style={{ scaleX: progress }} /> : <span className="bar__fill" style={{ transform: `scaleX(${k < i ? 1 : 0})` }} />}
          </span>
        ))}
      </div>
      <div className="memory__top">
        <span className="memory__brand">Nosotros<sup>®</sup></span>
        <div className="memory__btns">
          <button className="memory__btn" onClick={() => music.toggle()} style={{ opacity: musicOn ? 1 : 0.45 }} aria-label={musicOn ? 'Silenciar música' : 'Poner música'}>♪</button>
          <button className="memory__btn" onClick={() => setPaused((v) => !v)} aria-label={paused ? 'Reproducir' : 'Pausar'}>{paused ? '▶' : '❚❚'}</button>
          <button className="memory__btn" onClick={onClose} aria-label="Cerrar">✕</button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        <motion.div key={i} className="memory__slide" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }}>
          {s.type === 'photo' && (
            <>
              <img src={s.p.sm} alt="" className="memory__bg" aria-hidden="true" />
              <motion.img src={s.p.lg} alt="" className="memory__img" decoding="async"
                initial={reduce ? false : kbFrom} animate={reduce ? {} : kbTo} transition={{ duration: DURATION / 1000 + 1, ease: 'linear' }} />
              {s.line && (
                <motion.p className="memory__line" initial={{ opacity: 0, y: 24, filter: 'blur(8px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} transition={{ delay: 0.5, duration: 0.9 }}>
                  {s.line}
                </motion.p>
              )}
            </>
          )}
          {s.type === 'chapter' && (
            <div className="memory__card">
              {s.c.id === 'pitufos' && <PitufoDrops />}
              <motion.span className="eyebrow eyebrow--light" initial={{ opacity: 0, letterSpacing: '0.3em' }} animate={{ opacity: 1, letterSpacing: '0.08em' }} transition={{ duration: 1.2 }}>{s.c.eyebrow}</motion.span>
              <motion.h2 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ ...soft, delay: 0.2 }}>{s.c.title}</motion.h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7, duration: 1 }}>{s.c.quote}</motion.p>
            </div>
          )}
          {s.type === 'title' && (
            <div className="memory__card">
              <motion.span className="eyebrow eyebrow--light" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Un recuerdo para ustedes</motion.span>
              <h2 className="memory__big"><LetterTitle text="Nosotros" delay={0.3} /></h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>Toca a la derecha para avanzar, a la izquierda para regresar. Mantén presionado para pausar.</motion.p>
            </div>
          )}
          {s.type === 'end' && (
            <div className="memory__card">
              <h2 className="memory__big"><LetterTitle text="Continuará…" /></h2>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>Porque todavía nos faltan muchas fotos juntos.</motion.p>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} className="memory__endbtns">
                <Pill variant="coral" onClick={() => goTo(0)}>Ver de nuevo</Pill>
                <Pill variant="light" onClick={onClose}>Volver al álbum</Pill>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {s.type !== 'end' && (
        <div className="memory__tap">
          <button aria-label="Anterior" onClick={() => goTo(i - 1)} {...hold} />
          <button aria-label="Siguiente" onClick={() => goTo(i + 1)} {...hold} />
        </div>
      )}
    </motion.div>
  )
}
