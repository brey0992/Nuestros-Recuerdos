import { motion } from 'framer-motion'
import { spring, soft } from '../lib/hooks.js'

/** Imagen ligera: miniatura WebP y versión grande para pantallas de alta densidad. */
export function Photo({ p, sizes = '33vw', large = false, alt = '', ...props }) {
  return (
    <img
      src={large ? p.lg : p.sm}
      srcSet={large ? undefined : `${p.sm} 720w, ${p.lg} 1400w`}
      sizes={large ? undefined : sizes}
      alt={alt}
      loading="lazy"
      decoding="async"
      {...props}
    />
  )
}

export function Pill({ children, variant = 'outline', ...props }) {
  return (
    <motion.button whileTap={{ scale: 0.94 }} whileHover={{ y: -2 }} transition={spring} className={`pill pill--${variant}`} {...props}>
      {children}
    </motion.button>
  )
}

export function Arrow({ dir = 'right', ...props }) {
  return (
    <motion.button whileTap={{ scale: 0.86 }} whileHover={{ scale: 1.08 }} transition={spring} className="arrow" aria-label={dir === 'left' ? 'Anterior' : 'Siguiente'} {...props}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d={dir === 'left' ? 'M9 2 4 7l5 5' : 'M5 2l5 5-5 5'} stroke="currentColor" strokeWidth="1.4" fill="none" />
      </svg>
    </motion.button>
  )
}

export function Reveal({ children, delay = 0, className }) {
  return (
    <motion.div className={className} initial={{ opacity: 0.35, y: 36 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }} transition={{ ...soft, delay }}>
      {children}
    </motion.div>
  )
}

const wordVariants = {
  hide: { opacity: 0.15, y: 14, filter: 'blur(4px)' },
  show: { opacity: 1, y: 0, filter: 'blur(0px)', transition: soft },
}

/** Frase que aparece palabra por palabra al entrar en pantalla. */
export function WordReveal({ text, className }) {
  return (
    <motion.p className={className} initial="hide" whileInView="show" viewport={{ once: true, margin: '-80px' }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}>
      {text.split(' ').map((w, i) => (
        <motion.span key={i} className="word" variants={wordVariants}>{w}&nbsp;</motion.span>
      ))}
    </motion.p>
  )
}

const letterVariants = {
  hide: { opacity: 0, y: '0.5em', rotate: 6 },
  show: { opacity: 1, y: 0, rotate: 0, transition: soft },
}

/** Título que entra letra por letra. */
export function LetterTitle({ text, className, delay = 0 }) {
  return (
    <motion.span className={className} initial="hide" animate="show" aria-label={text}
      variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: delay } } }}>
      {[...text].map((ch, i) => (
        <motion.span key={i} className="ltr" aria-hidden="true" variants={letterVariants}>{ch === ' ' ? ' ' : ch}</motion.span>
      ))}
    </motion.span>
  )
}
