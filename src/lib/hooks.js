import { useEffect, useState } from 'react'
import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import { music } from './music.js'

export const spring = { type: 'spring', stiffness: 380, damping: 32 }
export const soft = { type: 'spring', stiffness: 120, damping: 20 }
export const easeOut = [0.22, 1, 0.36, 1]

export const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

// Solo inclinamos fotos con mouse: en el celular no hay "hover" y sería trabajo perdido.
const canHover = typeof window !== 'undefined' && window.matchMedia?.('(hover: hover) and (pointer: fine)').matches

/** Inclinación 3D que sigue al cursor. Devuelve estilo + handlers para el elemento. */
export function useTilt(max = 6) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const cfg = { stiffness: 200, damping: 18 }
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [max, -max]), cfg)
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-max, max]), cfg)
  if (!canHover) return { style: {}, handlers: {} }
  return {
    style: { rotateX, rotateY, transformPerspective: 1000 },
    handlers: {
      onPointerMove: (e) => {
        const r = e.currentTarget.getBoundingClientRect()
        mx.set((e.clientX - r.left) / r.width - 0.5)
        my.set((e.clientY - r.top) / r.height - 0.5)
      },
      onPointerLeave: () => { mx.set(0); my.set(0) },
    },
  }
}

/** ¿Está sonando la música? Se actualiza cuando cambia. */
export function useMusic() {
  const [on, setOn] = useState(music.playing)
  useEffect(() => music.onChange(setOn), [])
  return on
}

/** Bloquea el scroll de la página y escucha teclas mientras un modal está abierto. */
export function useModal(onKey) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', onKey) }
  }, [onKey])
}
