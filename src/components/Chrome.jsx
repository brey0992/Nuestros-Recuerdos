import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { music } from '../lib/music.js'
import { scrollToId, useMusic } from '../lib/hooks.js'
import { LetterTitle, Pill } from './ui.jsx'

export function Intro() {
  const [show, setShow] = useState(true)
  useEffect(() => { const t = setTimeout(() => setShow(false), 1900); return () => clearTimeout(t) }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.div className="intro" exit={{ y: '-100%' }} transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }} onClick={() => setShow(false)}>
          <LetterTitle text="Nosotros" className="intro__title" />
          <motion.span className="eyebrow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}>Un álbum de recuerdos</motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30 })
  return <motion.div className="progress" style={{ scaleX }} aria-hidden="true" />
}

/** Botón flotante de música. Las barritas y el pulso son CSS puro (no usan JavaScript por cuadro). */
export function MusicButton() {
  const on = useMusic()
  const [hint, setHint] = useState(true)
  useEffect(() => { const t = setTimeout(() => setHint(false), 9000); return () => clearTimeout(t) }, [])
  return (
    <div className="music">
      <AnimatePresence>
        {hint && !on && (
          <motion.span className="music__hint" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: 2.4 }}>
            Toca para poner música ♪
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button className={`music__btn ${on ? 'music__btn--on' : ''}`} whileTap={{ scale: 0.88 }} whileHover={{ scale: 1.06 }}
        onClick={() => { setHint(false); music.toggle() }} aria-label={on ? 'Pausar música' : 'Poner música'} aria-pressed={on}>
        <span className="eq" aria-hidden="true"><i /><i /><i /><i /></span>
      </motion.button>
    </div>
  )
}

export function Header({ onPlay }) {
  return (
    <header className="header wrap">
      <nav className="header__nav" aria-label="Secciones">
        <Pill onClick={() => scrollToId('capitulos')}>Capítulos ▾</Pill>
        <Pill onClick={() => scrollToId('carta')}>Para ustedes</Pill>
      </nav>
      <div className="logo"><LetterTitle text="Nosotros" delay={1.6} /><sup>®</sup></div>
      <div className="header__end">
        <motion.button className="play-icon" onClick={onPlay} whileTap={{ scale: 0.88 }} whileHover={{ rotate: 12 }} aria-label="Ver recuerdo en pantalla completa">
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="9" fill="none" stroke="currentColor" /><path d="M8 6.5v7l5.5-3.5z" fill="currentColor" /></svg>
        </motion.button>
      </div>
    </header>
  )
}
