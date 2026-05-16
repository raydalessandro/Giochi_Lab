# 🌍 Il Pianeta di Pongo

Gioco educativo di geografia per bambini 5-7 anni.
Modulo Next 15 (App Router) pronto da innestare.

## Cosa fa

**Esplorazione libera** (Δ — distinzione):
- Tocca un continente → si illumina, popup con animali (verso testuale), cibo tipico, curiosità.
- +1 ⭐ ogni continente nuovo scoperto.

**Mini-missioni progressive** (⇄ — relazione animale↔habitat):
- Dopo 3 continenti esplorati, parte una missione: "Aiuta il pinguino a tornare a casa!".
- L'animale appare in basso al centro, trascinabile sulla mappa.
- Hit-test su SVG con elementFromPoint + bbox fallback.
- Drop sul continente giusto → celebrazione + 2⭐. Sbagli → rimbalzo silenzioso, nessuna penalità.

## Integrazione

```bash
# Copia il modulo
cp -r pianeta-pongo app/giochi/

# Aggiungi alla home dell'app il bottone:
# {
#   emoji: '🌍',
#   title: 'Pongo',
#   subtitle: 'Esplora il mondo',
#   href: '/giochi/pianeta-pongo',
# }
```

## Dipendenze

Già presumibilmente nel tuo stack:
- `next@15`, `react@19`, `react-dom@19`
- `tailwindcss`
- `framer-motion` ← l'unica eventuale aggiunta:

```bash
npm i framer-motion
```

## Struttura

```
pianeta-pongo/
├── page.tsx                 # Entry route
├── _components/
│   ├── PianetaPongo.tsx     # Orchestratore (useReducer)
│   ├── WorldMap.tsx         # SVG mappa, animazioni continenti
│   ├── ContinentInfo.tsx    # Popup bottom-sheet con info
│   └── Celebration.tsx      # Confetti su missione completata
├── _data/
│   ├── continents.ts        # 7 continenti, path SVG, animali, cibo, curiosità
│   └── missions.ts          # Generatore missioni (bias verso animali iconici)
└── _hooks/
    └── useDragDrop.ts       # Drag unificato touch+pointer
```

## Note di design

**Perché 7 continenti e non 5/6?**
Per i bambini la suddivisione classica (Africa, Asia, Europa, Nord America, Sud America, Oceania, Antartide) è più riconoscibile — il pinguino vive in Antartide, l'Antartide va vista.

**Perché niente audio?**
Per scelta esplicita: i device sono spesso in muto. I "versi" appaiono come testo animato sopra l'animale al tap.

**Perché bias verso animali iconici nelle missioni?**
Panda→Asia, Canguro→Oceania, Leone→Africa, Pinguino→Antartide sono associazioni che un 5enne può fare. Gli animali meno iconici escono il 30% delle volte, come bonus.

**Perché celebrazione ma niente "errore"?**
Sbagliare = animale torna alla base in silenzio. La missione rimane attiva, il bambino riprova. Zero feedback negativo, in linea con la fascia d'età.

## Possibili evoluzioni

- **Modalità Viaggio** (per i 7enni più maturi): "Parti dall'Italia, arriva in Brasile passando per un oceano" → tappe ordinate, introduce sequenza (⟳).
- **Meteo reale** via API (OpenWeather, free tier): "Che tempo fa al Polo Nord oggi?".
- **Carta d'identità del continente** in modalità lettura: per chi sta imparando a leggere, le info diventano frasi semplici da decifrare.
- **Mini-puzzle**: ricomporre la mappa come puzzle a pezzi.
- **Bandiere reali** (ora sono emoji simboliche): per i 7 anni, riconoscere le bandiere dei paesi principali per continente.
