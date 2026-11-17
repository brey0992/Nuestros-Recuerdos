import { memo, useEffect, useRef } from 'react'
import { AnimatePresence, animate, motion, useInView, useScroll, useTransform } from 'framer-motion'
import { allCover, allPhotos, chapters, memoryLines } from '../data.js'
import { easeOut, scrollToId, soft, spring, useTilt } from '../lib/hooks.js'
import { Photo, Reveal, WordReveal } from './ui.jsx'

/* ---------- Círculos de capítulos ---------- */

const circleItems = [{ id: 'todos', short: 'Todos', cover: allCover }, ...chapters]

export function ChapterCircles({ active, setActive }) {
  const pick = (id) => {
    setActive(id)
    setTimeout(() => scrollToId(id === 'todos' ? 'galeria' : id), 60)
  }
  return (
    <section id="capitulos" className="circles wrap">
      <Reveal className="section-head">
        <span className="eyebrow">Capítulos</span>
        <h2 className="heading-lg">Elige un recuerdo</h2>
      </Reveal>
      <div className="circles__row">
        {circleItems.map((c, k) => (
          <motion.button key={c.id} className={`circle ${active === c.id ? 'circle--on' : ''}`} onClick={() => pick(c.id)} aria-pressed={active === c.id}
            initial={{ opacity: 0.4, y: 24, scale: 0.85 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
            transition={{ ...soft, delay: k * 0.07 }} whileHover={{ y: -6 }} whileTap={{ scale: 0.92 }}>
            <span className="circle__img">
              <Photo p={c.cover} sizes="120px" />
              {active === c.id && <motion.span layoutId="circle-ring" className="circle__ring" transition={spring} />}
            </span>
            <span className="circle__label">{c.short}</span>
          </motion.button>
        ))}
      </div>
      <div className="stats">
        <span><CountUp to={allPhotos.length} /> fotos</span><span aria-hidden="true">·</span>
        <span><CountUp to={chapters.length} duration={0.8} /> capítulos</span><span aria-hidden="true">·</span>
        <span>∞ risas</span>
      </div>
    </section>
  )
}

/** Cuenta hacia arriba escribiendo directo en el texto (sin re-render de React por cuadro). */
function CountUp({ to, duration = 1.4 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })
  useEffect(() => {
    if (!inView) return
    const ctrl = animate(0, to, { duration, ease: easeOut, onUpdate: (v) => { if (ref.current) ref.current.textContent = Math.round(v) } })
    return () => ctrl.stop()
  }, [inView, to, duration])
  return <span ref={ref}>{to}</span>
}

/* ---------- Galería ---------- */

const Tile = memo(function Tile({ p, k, onOpen, sizes }) {
  const tilt = useTilt(6)
  const d = k * 0.12
  return (
    <motion.button className="tile" style={{ flex: `${p.ratio} 1 0`, aspectRatio: p.ratio, ...tilt.style }} {...tilt.handlers}
      onClick={() => onOpen(p.id)} aria-label="Abrir foto" whileTap={{ scale: 0.97 }}
      initial={{ clipPath: 'inset(100% 0% 0% 0%)' }} whileInView={{ clipPath: 'inset(0% 0% 0% 0%)' }}
      viewport={{ once: true, margin: '-30px' }} transition={{ duration: 0.9, delay: d, ease: easeOut }}>
      <motion.div className="tile__inner" layoutId={`photo-${p.id}`}
        initial={{ scale: 1.25 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, delay: d, ease: easeOut }}>
        <Photo p={p} sizes={sizes} />
      </motion.div>
    </motion.button>
  )
})

/** Gotas de pintura azul (capítulo pitufos). Animación 100% CSS. */
const DROPS = Array.from({ length: 16 }, (_, i) => ({
  left: (i * 61) % 100, size: 8 + ((i * 7) % 22), delay: (i % 8) * 0.7, dur: 7 + (i % 5) * 1.6,
}))
export function PitufoDrops() {
  return (
    <div className="drops" aria-hidden="true">
      {DROPS.map((d, i) => (
        <span key={i} className="drop" style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
      ))}
    </div>
  )
}

const ROW_MAX_HEIGHT = 440

const Chapter = memo(function Chapter({ c, flip, onOpen }) {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [50, -50])
  const scale = useTransform(scrollYProgress, [0, 0.35], [0.88, 1])
  const line = useTransform(scrollYProgress, [0.05, 0.3], [0, 1])
  const pitufo = c.id === 'pitufos'
  return (
    <section id={c.id} ref={ref} className={`chapter wrap ${pitufo ? 'chapter--pitufo' : ''}`}>
      {pitufo && <PitufoDrops />}
      <motion.div className="chapter__rule" style={{ scaleX: line }} />
      <div className={`chapter__head ${flip ? 'chapter__head--flip' : ''}`}>
        <Reveal className="chapter__text">
          <span className="eyebrow">{c.eyebrow}</span>
          <h2 className="heading-lg">{c.title}</h2>
          <WordReveal text={c.quote} className="quote" />
        </Reveal>
        <motion.button className="chapter__cover" style={{ scale }} onClick={() => onOpen(c.cover.id)} aria-label="Abrir foto de portada">
          <motion.div className="chapter__cover-inner" layoutId={`photo-${c.cover.id}`} style={{ y }}>
            <Photo p={c.cover} sizes="(max-width: 760px) 100vw, 600px" />
          </motion.div>
        </motion.button>
      </div>
      <div className="rows">
        {c.rows.map((row, r) => {
          const sum = row.reduce((a, p) => a + p.ratio, 0)
          return (
            <div className="row" key={r} style={{ maxWidth: sum * ROW_MAX_HEIGHT }}>
              {row.map((p, k) => <Tile key={p.id} p={p} k={k} onOpen={onOpen} sizes={`${Math.ceil((p.ratio / sum) * 100)}vw`} />)}
            </div>
          )
        })}
      </div>
    </section>
  )
})

export function Gallery({ active, onOpen }) {
  const shown = active === 'todos' ? chapters : chapters.filter((c) => c.id === active)
  return (
    <div id="galeria">
      <AnimatePresence mode="popLayout">
        {shown.map((c, k) => (
          <motion.div key={c.id} layout initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={soft}>
            <Chapter c={c} flip={k % 2 === 1} onOpen={onOpen} />
            {k < shown.length - 1 && (
              <div className="interlude wrap">
                <motion.span className="interlude__mark" initial={{ scale: 0, rotate: -90 }} whileInView={{ scale: 1, rotate: 0 }} viewport={{ once: true }} transition={spring}>✦</motion.span>
                <WordReveal text={memoryLines[k % memoryLines.length]} className="interlude__text" />
              </div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
