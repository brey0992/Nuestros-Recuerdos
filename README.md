# Nuestros Recuerdos

Álbum de fotos con mis amigos hecho econ React Vite
## Cómo correrlo

```bash
npm install
npm run dev       
npm run build     
```

## Agregar fotos

1. Copia la foto a `fotos-originales/` con un nombre como `foto-50.jpg`.
2. Corre `npm run fotos` (crea las versiones WebP en `public/fotos/sm` y `public/fotos/lg`
   y actualiza `src/fotos.json`).
3. Agrega el número (`50`) en una fila del capítulo que quieras en `src/data.js`.

## Estructura

```
src/data.js          capítulos, frases y orden de fotos
src/App.jsx          une todas las secciones
src/components/      Hero, Galería, Visor, Modo recuerdo, Carta…
src/lib/music.js     música de fondo (Web Audio)
src/lib/hooks.js     animaciones y utilidades compartidas
scripts/fotos.mjs    optimizador de fotos

