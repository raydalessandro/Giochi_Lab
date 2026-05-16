# 📐 La Geometria

Gemello concettuale del **Laboratorio** (chimica) per bambini 5-7 anni.
Una specie di "paint geometrico aumentato" dove il bambino costruisce figure
combinando lati di tre lunghezze (3, 4, 5) e scopre le forme.

## Filosofia condivisa col Laboratorio

Stessa grammatica, materia diversa:

| Aspetto | Laboratorio | Geometria |
|---|---|---|
| Mattoncino (Δ) | Atomo con manine | Segmento con estremità |
| Regola (⇄) | Manine si chiudono a coppie | Estremità si fondono in vertici |
| Soglia (P3) | Tutte manine occupate | Ciclo chiuso (poligono) |
| Emergenza | Molecola "vive" | Figura "prende vita" |
| Cross-ref | Mostra forma molecolare | Mostra "in natura" e link a molecole |

Il bambino che ha giocato al Laboratorio **riconosce subito il pattern**: pulsa = libero, click = aggancio, tutto verde = qualcosa di nuovo appare. Esattamente quello che volevamo.

## Cosa scopre il bambino

**9 forme** di base, classificate automaticamente dai lati usati:

- 🔺 Triangolo equilatero (3 lati uguali)
- 📐 **Triangolo rettangolo 3-4-5** ← Pitagora! +5⭐ bonus
- 🔼 Triangolo isoscele (2 lati uguali)
- ◣ Triangolo scaleno (3 lati diversi)
- 🔷 Rombo (4 lati uguali)
- 🟦 Rettangolo (2+2 lati uguali)
- 🔶 Quadrilatero generico
- ⬟ Pentagono (5 lati)
- ⬢ **Esagono** (6 lati) — qui scopre il favo d'ape + cross-ref con grafite

## Meccanica chiave

**Lati con lunghezza fissa:** corto (3, verde), medio (4, blu), lungo (5, viola). Il bambino non li allunga — sceglie quale lunghezza vuole dal palette.

**Tre tipi di drag per segmento:**
- **Corpo**: sposta tutto il segmento
- **Pallino A**: ruota il segmento attorno a B (lunghezza preservata)
- **Pallino B**: ruota il segmento attorno ad A (lunghezza preservata)

**Snap automatico:** quando un pallino libero si avvicina a un altro pallino libero entro `SNAP_DISTANCE = 28px`, si fondono in un vertice condiviso. Il pallino glow-a viola durante il drag se è in zona snap.

**Detection poligono:** quando il grafo dei segmenti forma un ciclo chiuso (ogni vertice ha grado 2, grafo connesso, |V|=|E|), parte la scoperta.

**Pitagora bonus:** quando i 3 lati sono uno corto + uno medio + uno lungo (3, 4, 5), parte un popup speciale con +5⭐. Concettualmente: il bambino ha appena costruito *il* triangolo di Pitagora.

## Integrazione

```bash
cp -r geometria app/giochi/

# Nella home:
# { emoji: '📐', title: 'Geometria', subtitle: 'Costruisci le forme', href: '/giochi/geometria' }
```

Dipendenze: `framer-motion` (già presente).

## Struttura

```
geometria/
├── page.tsx
├── _components/
│   ├── Geometria.tsx          # Orchestratore
│   ├── StageSegment.tsx       # ⭐ Componente segmento con 3 manopole drag
│   ├── SegmentPalette.tsx     # Barra in basso, scegli corto/medio/lungo
│   └── ShapeDiscovery.tsx     # Popup scoperta con "in natura" + Pitagora bonus
├── _data/
│   └── shapes.ts              # 9 forme, fatti, esempi in natura, cross-ref
├── _hooks/
│   └── useDrag.ts             # ⚠️ Identico a laboratorio/_hooks/useDrag.ts
└── _lib/
    ├── composition.ts         # ⚠️ Identico a laboratorio/_lib/composition.ts
    └── geometry.ts            # Specifico: segmenti, snap, detection poligono
```

## ⭐ Refactor consigliato dopo aver montato i 4 giochi

Quando hai tutti e 4 i giochi in app/giochi/, sposta i file condivisi in `app/_shared/`:

```
app/
├── _shared/
│   ├── composition.ts         # da laboratorio + geometria
│   ├── useDrag.ts             # idem
│   └── ui/
│       ├── DiscoveryPopup.tsx (astrarre)
│       └── CollectionPanel.tsx (astrarre)
├── giochi/
│   ├── pianeta-pongo/
│   ├── laboratorio/
│   ├── geometria/
│   └── fisica/    # prossimo
```

Risparmio: ~30% di codice duplicato. Più importante: i 4 giochi diventano un sistema con identità visiva e d'interazione coerente — il bambino impara una lingua di gioco unica.

## Punti delicati

- **SNAP_DISTANCE = 28px** — tarata per dito adulto. Per bambini di 5 anni con dito piccolo, alzare a ~36px se in produzione vedi che faticano. Una riga in `_lib/geometry.ts`.
- **Rotazione vincolata su endpoint**: ho scelto che trascinando un endpoint, l'altro resta ancorato e la lunghezza è preservata. È intuitivo (come una porta che gira sui cardini). Se vedi confusione, si può cambiare a "endpoint sposta tutto" — basta cambiare il branch `which === 'a' || 'b'` in `StageSegment.tsx`.
- **Triangolo rettangolo 3-4-5**: rilevato dalla *composizione* dei lati (1 short + 1 medium + 1 long), non dalla *geometria reale* (angoli). Il bambino può anche aver costruito un triangolo *non* rettangolo con lati 3-4-5 (esiste solo una configurazione possibile, ma le posizioni potrebbero essere imprecise). Per i bambini va benissimo, ma se vuoi essere rigoroso si può aggiungere un check sull'angolo opposto al lato 5 (deve essere ~90°).

## Cosa NON ho fatto (volutamente)

- **Tassellazioni** (modalità "piastrella il pavimento"): meccanica diversa, merita un suo modulo. La aggiungiamo dopo come modalità extra.
- **Simmetria specchio**: idem, meccanica diversa (paint speculare). Modulo separato.
- **Archimede**: idem, sliders + cerchio + riempimento. Modulo separato.
- **Fibonacci easter egg**: bonus per dopo, quando hai tutti i giochi.

Per ora la **costruzione libera + Pitagora come bonus** copre l'80% del valore didattico con il 30% del codice. Le altre modalità si innestano facili quando vorrai.
