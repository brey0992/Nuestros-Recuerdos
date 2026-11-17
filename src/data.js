// Contenido del álbum: capítulos, frases y orden de las fotos.
// Cada capítulo tiene "filas": las fotos de una fila se acomodan a la misma altura
// (como en Fotos del iPhone). Las proporciones salen de src/fotos.json (npm run fotos).
import ratios from './fotos.json'

const name = (n) => `foto-${String(n).padStart(2, '0')}`

/** Una foto con su miniatura (sm), su versión grande (lg) y su proporción. */
export const photo = (n, chapter) => ({
  id: n,
  chapter,
  sm: `fotos/sm/${name(n)}.webp`,
  lg: `fotos/lg/${name(n)}.webp`,
  ratio: ratios[name(n)] ?? 1,
})

const raw = [
  {
    id: 'cumples',
    eyebrow: 'Capítulo uno',
    title: 'Velitas, pastel y ustedes',
    short: 'Cumpleaños',
    quote: 'El mejor regalo de cada cumpleaños fue tenerlos alrededor de la mesa.',
    cover: 6,
    rows: [[2, 26, 4], [27]],
    lines: ['Pide un deseo… aunque ya lo tenemos todo.', 'Contigo cualquier plan se vuelve historia.'],
  },
  {
    id: 'aventuras',
    eyebrow: 'Capítulo dos',
    title: 'Monte, río y barro',
    short: 'Aventuras',
    quote: 'Nos perdimos en el monte y nos encontramos en las risas.',
    cover: 9,
    rows: [[10, 13, 5], [41, 42, 43], [7, 11, 8, 44]],
    lines: ['Caminamos horas y valió cada paso.', 'El río se llevó el cansancio y nos dejó esto.'],
  },
  {
    id: 'piscina',
    eyebrow: 'Capítulo tres',
    title: 'Un día entero en la piscina',
    short: 'Piscina',
    quote: 'Sol, agua fría y nadie con ganas de salirse. Así se ven los días perfectos.',
    cover: 39,
    rows: [[37, 38, 40]],
    lines: ['Flotar sin pensar en nada, solo en ustedes.', 'Ojalá todos los domingos fueran así.'],
  },
  {
    id: 'cometas',
    eyebrow: 'Capítulo cuatro',
    title: 'Cometas en el cielo',
    short: 'Cometas',
    quote: 'Subimos al mirador a elevar cometas y terminamos tirados en el pasto mirando las nubes.',
    cover: 33,
    rows: [[32, 35, 34]],
    lines: ['Que nuestros sueños vuelen así de alto.', 'El viento a favor y ustedes al lado.'],
  },
  {
    id: 'pitufos',
    eyebrow: 'Capítulo cinco',
    title: 'La noche que nos pintamos de pitufos',
    short: 'Pitufos',
    quote: 'Nos pintamos de pitufos y salimos a la calle como si nada. La mejor locura que hemos hecho juntos.',
    cover: 19,
    rows: [[15, 14, 16], [17, 18], [3, 12]],
    lines: ['Azules por fuera, felices por dentro.', 'Las mejores noches nunca se planean.'],
  },
  {
    id: 'paseos',
    eyebrow: 'Capítulo seis',
    title: 'Atardeceres en buena compañía',
    short: 'Paseos',
    quote: 'Cualquier lugar se vuelve bonito cuando llegamos todos juntos.',
    cover: 22,
    rows: [[30, 31, 21, 36], [24, 28], [20, 25]],
    lines: ['Atardeceres que solo valen la pena con ustedes.', 'Que la vida nos siga juntando.'],
  },
  {
    id: 'diario',
    eyebrow: 'Capítulo siete',
    title: 'Cancha, UNO y biblioteca',
    short: 'Día a día',
    quote: 'No todo tiene que ser una gran salida. Un partido bajo la lluvia o una ronda de UNO también se vuelven recuerdos.',
    cover: 48,
    rows: [[47, 49, 45, 46]],
    lines: ['Lo simple, con ustedes, se vuelve especial.', 'Hasta un atardecer en la cancha se siente como película.'],
  },
]

export const chapters = raw.map((c) => {
  const rows = c.rows.map((r) => r.map((n) => photo(n, c.id)))
  const cover = photo(c.cover, c.id)
  // orden de la historia: portada primero y luego fila por fila
  return { ...c, cover, rows, photos: [cover, ...rows.flat()] }
})

export const allPhotos = chapters.flatMap((c) => c.photos)
export const photoIndex = new Map(allPhotos.map((p, i) => [p.id, i]))

export const heroSlides = [49, 41, 39, 5, 17, 33, 6].map((n) => photo(n))
export const stripPhotos = [2, 41, 39, 33, 17, 49].map((n) => photo(n))
export const letterPhoto = photo(27)
export const allCover = photo(30)

// Frases entre capítulos
export const memoryLines = [
  'Los amigos son la familia que uno escoge.',
  'No recordamos los días, recordamos los momentos.',
  'Reírnos hasta que duela la panza.',
  'Si volviera a empezar, los escogería otra vez.',
  'Gracias por cada abrazo, cada chiste y cada locura.',
  'Lo bonito no es el lugar, es con quién llegas.',
]
