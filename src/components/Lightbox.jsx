import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { allPhotos, chapters, photoIndex } from '../data.js'
import { spring, useModal } from '../lib/hooks.js'
import { Arrow, Pill } from './ui.jsx'

const total = allPhotos.length
const chapterName = Object.fromEntries(chapters.map((c) => [c.id, c.short]))

/** Visor tipo Fotos del iPhone: se abre desde la miniatura, desliza para pasar, hacia abajo para cerrar. */
export function Lightbox({ startId, onClose }) {
  const [idx, setIdx] = useState(() => photoIndex.get(startId) ?? 0)
  const [dir, setDir] = useState(0)
  const p = allPhotos[idx]
  const isStart = p.id === startId

  const go = useCallback((d) => { setDir(d); setIdx((v) => (v + d + total) % total) }, [])
  useModal(useCallback((e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
  }, [go, onClose]))

  // precarga las fotos vecinas
  useEffect(() => {
    for (const d of [1, -1]) new Image().src = allPhotos[(idx + d + total) % total].lg
  }, [idx])

  const stop = (e) => e.stopPropagation()

  return (
    <motion.div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label="Foto"
      initial={{ backgroundColor: 'rgba(255,245,230,0)' }} animate={{ backgroundColor: 'rgba(255,245,230,0.97)' }} exit={{ backgroundColor: 'rgba(255,245,230,0)' }}>
      <motion.div className="lightbox__bar" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} onClick={stop}>
        <span className="eyebrow">{chapterName[p.chapter]} · {idx + 1} / {total}</span>
        <Pill onClick={onClose}>Cerrar</Pill>
      </motion.div>
      <div className="lightbox__stage">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img key={p.id} layoutId={isStart ? `photo-${p.id}` : undefined} src={p.lg} alt="" className="lightbox__img" decoding="async"
            initial={isStart ? false : { x: dir * 160, opacity: 0, scale: 0.92, rotate: dir * 3 }}
            animate={{ x: 0, opacity: 1, scale: 1, rotate: 0 }}
            exit={{ x: dir * -160, opacity: 0, scale: 0.92, rotate: dir * -3 }}
            transition={spring} drag dragSnapToOrigin dragElastic={0.6} onClick={stop}
            onDragEnd={(_, { offset: o }) => {
              if (Math.abs(o.y) > 140 && Math.abs(o.y) > Math.abs(o.x)) onClose()
              else if (o.x < -80) go(1)
              else if (o.x > 80) go(-1)
            }} />
        </AnimatePresence>
      </div>
      <motion.div className="lightbox__nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={stop}>
        <Arrow dir="left" onClick={() => go(-1)} />
        <span className="hint">Desliza para pasar · hacia abajo para cerrar</span>
        <Arrow dir="right" onClick={() => go(1)} />
      </motion.div>
    </motion.div>
  )
}
