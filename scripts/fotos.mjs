// Optimiza las fotos: npm run fotos
// Lee fotos-originales/*.jpg|jpeg|png y genera dos tamaños en WebP:
//   public/fotos/sm/<nombre>.webp  (miniatura, 720px de lado mayor)
//   public/fotos/lg/<nombre>.webp  (pantalla completa, 1400px)
// y escribe src/fotos.json con la proporción (ancho/alto) de cada foto.
// Para agregar fotos nuevas: ponlas en fotos-originales/ con nombre foto-NN.jpg y corre el script.
import sharp from 'sharp'
import { readdir, mkdir, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const src = path.join(root, 'fotos-originales')
const sizes = { sm: { max: 720, quality: 72 }, lg: { max: 1400, quality: 74 } }

const files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort()
for (const dir of Object.keys(sizes)) await mkdir(path.join(root, 'public/fotos', dir), { recursive: true })

const ratios = {}
let before = 0, after = 0
await Promise.all(files.map(async (file) => {
  const name = file.replace(/\.[^.]+$/, '')
  const input = path.join(src, file)
  const { size } = await stat(input)
  before += size
  const img = sharp(input).rotate() // respeta la orientación EXIF
  const { width, height } = await img.clone().toBuffer({ resolveWithObject: true }).then((r) => r.info)
  ratios[name] = Math.round((width / height) * 1000) / 1000
  for (const [dir, { max, quality }] of Object.entries(sizes)) {
    const out = path.join(root, 'public/fotos', dir, `${name}.webp`)
    const info = await img.clone().resize(max, max, { fit: 'inside', withoutEnlargement: true }).webp({ quality, effort: 5 }).toFile(out)
    after += info.size
  }
}))

const sorted = Object.fromEntries(Object.entries(ratios).sort())
await writeFile(path.join(root, 'src/fotos.json'), JSON.stringify(sorted, null, 2) + '\n')
console.log(`${files.length} fotos · originales ${(before / 1e6).toFixed(1)} MB → web ${(after / 1e6).toFixed(1)} MB (sm + lg)`)
