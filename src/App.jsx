import { useCallback, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { music } from './lib/music.js'
import { ConfettiLayer } from './components/Confetti.jsx'
import { Header, Intro, MusicButton, ScrollProgress } from './components/Chrome.jsx'
import { Hero } from './components/Hero.jsx'
import { ChapterCircles, Gallery } from './components/Gallery.jsx'
import { CoralBanner, Letter, Strip } from './components/Footer.jsx'
import { Lightbox } from './components/Lightbox.jsx'
import { MemoryPlayer } from './components/MemoryPlayer.jsx'

export default function App() {
  const [active, setActive] = useState('todos')
  const [open, setOpen] = useState(null)
  const [playing, setPlaying] = useState(false)

  // funciones estables: así los capítulos memorizados no se vuelven a dibujar al abrir una foto
  const play = useCallback(() => { setPlaying(true); music.play() }, [])
  const closeLightbox = useCallback(() => setOpen(null), [])
  const closePlayer = useCallback(() => setPlaying(false), [])

  return (
    <ConfettiLayer>
      <Intro />
      <ScrollProgress />
      <Header onPlay={play} />
      <main>
        <Hero onPlay={play} />
        <ChapterCircles active={active} setActive={setActive} />
        <Gallery active={active} onOpen={setOpen} />
        <Letter />
      </main>
      <CoralBanner />
      <Strip onOpen={setOpen} />
      <footer className="footer wrap">
        <span className="logo logo--sm">Nosotros<sup>®</sup></span>
        <span className="caption">Hecho con cariño · 2026</span>
      </footer>
      {!playing && <MusicButton />}

      <AnimatePresence>{open !== null && <Lightbox key="lb" startId={open} onClose={closeLightbox} />}</AnimatePresence>
      <AnimatePresence>{playing && <MemoryPlayer key="mp" onClose={closePlayer} />}</AnimatePresence>
    </ConfettiLayer>
  )
}
