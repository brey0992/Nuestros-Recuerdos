# Nuestros Recuerdos

Álbum de fotos con amigos hecho en React + Vite + Framer Motion: capítulos con frases,
galería estilo Fotos del iPhone, visor con deslizar, modo "recuerdo" a pantalla completa
y música de fondo generada en el navegador.

## Cómo correrlo

```bash
npm install
npm run dev       # abre http://localhost:5173
npm run build     # versión final en dist/
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
```

## Publicar

`npm run build` y sube la carpeta `dist/` a Netlify (app.netlify.com/drop), Vercel o GitHub Pages.
