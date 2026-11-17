import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { heroSlides } from '../data.js'
import { scrollToId, soft, easeOut, useTilt } from '../lib/hooks.js'
import { Arrow, Pill } from './ui.jsx'

const fadeUp = { hide: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: soft } }
const n = heroSlides.length

export function Hero({ onPlay }) {
  const [i, setI] = useState(0)
  const tilt = useTilt(5)

  // cambia sola cada 5 s; si tocas una flecha, el contador vuelve a empezar
  useEffect(() => { const t = setTimeout(() => setI((v) => (v + 1) % n), 5000); return () => clearTimeout(t) }, [i])
  // precarga la siguiente para que el cambio sea instantáneo
  useEffect(() => { new Image().src = heroSlides[(i + 1) % n].lg }, [i])

  return (
    <section className="hero wrap">
      <motion.div className="hero__media" style={tilt.style} {...tilt.handlers}
        initial={{ clipPath: 'inset(8% 8% 8% 8%)' }} animate={{ clipPath: 'inset(0% 0% 0% 0%)' }} transition={{ duration: 1.2, delay: 1.7, ease: easeOut }}>
        <AnimatePresence initial={false}>
          <motion.img key={i} src={heroSlides[i].lg} alt="Recuerdo con los amigos" className="hero__img" fetchpriority={i === 0 ? 'high' : 'auto'}
            initial={{ opacity: 0, scale: 1.14 }} animate={{ opacity: 1, scale: 1.02 }} exit={{ opacity: 0 }}
            transition={{ opacity: { duration: 1.1 }, scale: { duration: 6, ease: 'linear' } }} />
        </AnimatePresence>
        <div className="hero__arrows">
          <Arrow dir="left" onClick={() => setI((i - 1 + n) % n)} />
          <Arrow dir="right" onClick={() => setI((i + 1) % n)} />
        </div>
        <div className="dots" aria-hidden="true">
          {heroSlides.map((_, k) => <span key={k} className={k === i ? 'dot dot--on' : 'dot'} />)}
        </div>
      </motion.div>

      <motion.div className="hero__copy" initial="hide" animate="show" variants={{ show: { transition: { staggerChildren: 0.14, delayChildren: 1.8 } } }}>
        <motion.span className="eyebrow" variants={fadeUp}>Nuevo · Álbum 2026</motion.span>
        <motion.h1 className="display" variants={fadeUp}>Lo mejor de la vida <em className="shimmer">son ustedes.</em></motion.h1>
        <motion.p className="body" variants={fadeUp}>
          Cumpleaños, cascadas, días de piscina, cometas, la noche que nos pintamos de pitufos y atardeceres en la cancha que no queríamos que se acabaran.
          Aquí guardé todo para que nunca se nos olvide.
        </motion.p>
        <motion.div className="hero__ctas" variants={fadeUp}>
          <Pill variant="coral" onClick={onPlay}>▶ Ver como recuerdo</Pill>
          <Pill variant="terracotta" onClick={() => scrollToId('capitulos')}>Ver todas las fotos</Pill>
        </motion.div>
      </motion.div>
    </section>
  )
}
