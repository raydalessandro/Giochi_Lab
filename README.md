# Giochi Lab

Quattro giochi per imparare giocando, fascia 5–7 anni.

## Stack

- Next 15 (App Router) + TypeScript
- Tailwind CSS
- framer-motion

## Sviluppo

```bash
npm install
npm run dev
```

Apri http://localhost:3000.

## Struttura

```
app/
├── layout.tsx
├── page.tsx              # Home con le 4 card
├── globals.css
└── giochi/
    ├── pianeta-pongo/    # 🌍 Geografia
    ├── laboratorio/      # 🧪 Chimica
    ├── geometria/        # 📐 Geometria
    └── fisica/           # ⚙️ Fisica
```

I giochi vengono montati uno alla volta, ognuno sulla propria feature branch, con merge su `main` dopo OK su preview Vercel.

## Deploy

Push su `main` → produzione Vercel. Push su qualsiasi branch → preview Vercel.

## Environment variables

Le chiavi delle API esterne stanno **solo sul server** (route handlers in `app/api/`).
Mai esposte al client.

| Variable | Source | Free tier | Status |
|---|---|---|---|
| `PEXELS_API_KEY` | https://www.pexels.com/api/ | 200 req/h, 20k/mese | configurata |
| `FREESOUND_API_KEY` | https://freesound.org/apiv2/apply/ | senza limiti seri (preview MP3) | configurata |
| `UNSPLASH_ACCESS_KEY` | https://unsplash.com/developers | 50 req/h (demo) | in attesa di approvazione |

**Locale**: copia `.env.example` in `.env.local` e riempi i valori. `.env.local` è gitignored.

**Vercel**: Project Settings → Environment Variables. Imposta su tutti e tre gli ambienti
(Production, Preview, Development) se vuoi che le preview funzionino.

I route handler ritornano **503** se la chiave corrispondente non è configurata —
così l'app gira anche senza, e i client falliscono silenziosamente (vedi
`app/_shared/api.ts`).

## Bundle sorgente

Il bundle originale dei giochi è in `giochi-bundle.zip` (con README per ogni gioco). Resta nella repo come reference finché tutti i giochi non sono montati.
