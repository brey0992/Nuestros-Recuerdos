import { motion } from 'framer-motion'
import { letterPhoto, stripPhotos } from '../data.js'
import { soft } from '../lib/hooks.js'
import { useConfetti } from './Confetti.jsx'
import { Photo, Pill, Reveal } from './ui.jsx'

export function Letter() {
  const burst = useConfetti()
  return (
    <section id="carta" className="letter wrap">
      <Reveal className="letter__text">
        <span className="eyebrow">Una carta</span>
        <h2 className="heading-lg">Para mis amigos</h2>
        <p className="body">
          Hice esta página porque hay momentos que no caben en un chat. Cada foto aquí tiene un chiste interno,
          una caminata larga, una canción a todo volumen o un pastel que llegó justo a tiempo.
        </p>
        <p className="body">
          Gracias por aparecer siempre, por los planes improvisados y por hacer que lo normal se sintiera especial.
          Ojalá esta lista de recuerdos nunca se termine.
        </p>
        <motion.p className="signature" initial={{ clipPath: 'inset(0 100% 0 0)' }} whileInView={{ clipPath: 'inset(0 0% 0 0)' }} viewport={{ once: true }} transition={{ duration: 1.6, ease: 'easeInOut' }}>
          con cariño <button className="heart" onClick={(e) => burst(e.clientX, e.clientY, 80)} aria-label="Mandar corazones">♡</button>
        </motion.p>
        <span className="caption">Toca el corazón ↑</span>
        <Pill variant="terracotta" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Volver al inicio</Pill>
      </Reveal>
      <motion.div className="letter__img" initial={{ rotate: 4, y: 40, opacity: 0.4 }} whileInView={{ rotate: -2, y: 0, opacity: 1 }} viewport={{ once: true }} transition={soft}>
        <Photo p={letterPhoto} sizes="(max-width: 760px) 100vw, 600px" />
      </motion.div>
    </section>
  )
}

const LINE = 'Gracias por ser parte de mi historia  ✦  '.repeat(4)

/** Cinta coral que se desliza sola (CSS). */
export function CoralBanner() {
  return (
    <section className="banner" aria-label="Gracias por ser parte de mi historia">
      <div className="banner__track"><span>{LINE}</span><span aria-hidden="true">{LINE}</span></div>
    </section>
  )
}

export function Strip({ onOpen }) {
  return (
    <section className="strip wrap">
      {stripPhotos.map((p, k) => (
        <motion.button key={p.id} className="strip__item" onClick={() => onOpen(p.id)} aria-label="Abrir foto"
          initial={{ opacity: 0.3, y: 40, rotate: k % 2 ? 4 : -4 }} whileInView={{ opacity: 1, y: 0, rotate: 0 }} viewport={{ once: true }}
          transition={{ ...soft, delay: k * 0.06 }} whileHover={{ y: -8, rotate: k % 2 ? 2 : -2 }}>
          <Photo p={p} sizes="(max-width: 640px) 33vw, 200px" />
        </motion.button>
      ))}
    </section>
  )
}
