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

## Bundle sorgente

Il bundle originale dei giochi è in `giochi-bundle.zip` (con README per ogni gioco). Resta nella repo come reference finché tutti i giochi non sono montati.
