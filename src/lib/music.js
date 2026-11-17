// Música de fondo original, generada en el navegador (Web Audio).
// Una progresión cálida y lenta: pad suave + arpegio tipo cajita musical + bajo.
// El navegador solo deja sonar audio después de que la persona toca algo.

const BPM = 76
const BEAT = 60 / BPM
const midi = (m) => 440 * Math.pow(2, (m - 69) / 12)

// Fmaj7 · Dm9 · B♭maj7 · C(sus) — cada acorde dura 2 compases
const CHORDS = [
  { root: 41, notes: [53, 57, 60, 64] },
  { root: 38, notes: [50, 53, 57, 60, 64] },
  { root: 46, notes: [50, 53, 57, 58] },
  { root: 48, notes: [52, 55, 60, 62] },
]
// melodía (en semitonos MIDI, null = silencio) por acorde, 16 corcheas
const MELODY = [
  [72, null, 69, null, 72, 74, null, 72, 69, null, null, 67, 69, null, null, null],
  [69, null, 72, null, 74, null, 72, 69, 65, null, null, null, 67, 69, null, null],
  [70, null, 69, null, 65, null, 62, 65, 69, null, 70, null, 69, null, null, null],
  [67, null, 64, null, 67, 69, null, 72, 74, null, null, 72, 67, null, null, null],
]

export class Music {
  constructor() {
    this.ctx = null
    this.playing = false
    this.step = 0
    this.nextTime = 0
    this.timer = null
    this.listeners = new Set()
  }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn) }
  emit() { this.listeners.forEach((fn) => fn(this.playing)) }

  setup() {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return false
    const ctx = (this.ctx = new AC())
    this.master = ctx.createGain()
    this.master.gain.value = 0
    const comp = ctx.createDynamicsCompressor()
    this.master.connect(comp).connect(ctx.destination)

    // eco suave para el arpegio
    this.delay = ctx.createDelay(2)
    this.delay.delayTime.value = BEAT * 0.75
    const fb = ctx.createGain(); fb.gain.value = 0.32
    const dl = ctx.createBiquadFilter(); dl.type = 'lowpass'; dl.frequency.value = 2400
    this.delay.connect(dl).connect(fb).connect(this.delay)
    const wet = ctx.createGain(); wet.gain.value = 0.35
    dl.connect(wet).connect(this.master)

    // filtro cálido para el pad
    this.padBus = ctx.createBiquadFilter()
    this.padBus.type = 'lowpass'; this.padBus.frequency.value = 900; this.padBus.Q.value = 0.4
    this.padBus.connect(this.master)

    // si cambian de app o de pestaña, el audio se duerme y no gasta batería
    document.addEventListener('visibilitychange', () => {
      if (!this.playing) return
      document.hidden ? this.ctx.suspend() : this.ctx.resume()
    })
    return true
  }

  async play() {
    if (!this.ctx && !this.setup()) return
    if (this.ctx.state === 'suspended') await this.ctx.resume()
    if (this.playing) return
    this.playing = true
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setValueAtTime(this.master.gain.value, t)
    this.master.gain.linearRampToValueAtTime(0.55, t + 2.5)
    this.nextTime = t + 0.1
    clearInterval(this.timer)
    this.timer = setInterval(() => this.schedule(), 50)
    this.emit()
  }

  pause() {
    if (!this.playing) return
    this.playing = false
    const t = this.ctx.currentTime
    this.master.gain.cancelScheduledValues(t)
    this.master.gain.setValueAtTime(this.master.gain.value, t)
    this.master.gain.linearRampToValueAtTime(0, t + 0.8)
    clearInterval(this.timer)
    this.emit()
  }

  toggle() { this.playing ? this.pause() : this.play() }

  schedule() {
    const eighth = BEAT / 2
    if (this.nextTime < this.ctx.currentTime - 0.5) this.nextTime = this.ctx.currentTime + 0.05
    while (this.nextTime < this.ctx.currentTime + 0.25) {
      const s = this.step
      const chordIdx = Math.floor(s / 16) % CHORDS.length
      const c = CHORDS[chordIdx]
      const pos = s % 16
      const t = this.nextTime

      if (pos === 0) {
        c.notes.forEach((n) => this.pad(midi(n), t, eighth * 16))
        this.bass(midi(c.root), t, eighth * 6)
      }
      if (pos === 8) this.bass(midi(c.root + 7), t, eighth * 4)

      // arpegio suave una octava arriba
      if (pos % 2 === 1) {
        const n = c.notes[(pos >> 1) % c.notes.length] + 12
        this.pluck(midi(n), t, 0.05)
      }
      // melodía tipo cajita musical (aparece desde la segunda vuelta)
      const m = MELODY[chordIdx][pos]
      if (m && s >= 64) this.pluck(midi(m + 12), t, 0.11, true)

      this.step++
      this.nextTime += eighth
    }
  }

  pad(freq, t, dur) {
    const ctx = this.ctx
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.05, t + 1.2)
    g.gain.setValueAtTime(0.05, t + dur - 0.6)
    g.gain.linearRampToValueAtTime(0, t + dur + 0.6)
    g.connect(this.padBus)
    ;[-6, 6].forEach((det) => {
      const o = ctx.createOscillator()
      o.type = 'triangle'; o.frequency.value = freq; o.detune.value = det
      o.connect(g); o.start(t); o.stop(t + dur + 0.7)
    })
  }

  bass(freq, t, dur) {
    const ctx = this.ctx
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.16, t + 0.04)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + 0.1)
  }

  pluck(freq, t, vol, bell = false) {
    const ctx = this.ctx
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0008, t + (bell ? 2.2 : 1.1))
    g.connect(this.master); g.connect(this.delay)
    const o = ctx.createOscillator(); o.type = 'sine'; o.frequency.value = freq
    o.connect(g); o.start(t); o.stop(t + 2.4)
    if (bell) {
      // armónico brillante para sonar a cajita musical
      const o2 = ctx.createOscillator(); o2.type = 'sine'; o2.frequency.value = freq * 3.01
      const g2 = ctx.createGain()
      g2.gain.setValueAtTime(vol * 0.25, t); g2.gain.exponentialRampToValueAtTime(0.0005, t + 0.6)
      o2.connect(g2).connect(g); o2.start(t); o2.stop(t + 0.7)
    }
  }
}

export const music = new Music()
