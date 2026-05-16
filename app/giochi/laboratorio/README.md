# 🧪 Il Laboratorio

Gioco educativo di "chimica visiva" per bambini 5-7 anni.
Modulo Next 15 (App Router), gemello concettuale del Pianeta di Pongo.

## Filosofia didattica

**Non insegna formule.** Insegna **regole di composizione** — il meta-pattern che governa chimica, geometria, biologia, musica.

Il bambino scopre giocando che:

1. Ogni atomo ha un **numero fisso di manine** (valenza, mai nominata) — visibili come piccole protuberanze che pulsano quando sono libere
2. Le manine **si chiudono a coppie** (legame) — quando avvicini due atomi con manine libere, *scatta* l'aggancio
3. Quando **tutte le manine sono occupate**, la molecola "prende vita" → emoji, animazione, popup
4. Manine residue = struttura instabile → indicato col contatore "Manine libere: N"

Questo è P3 di EAR letterale: sotto soglia di stabilità non succede nulla, sopra → trasformazione discreta.

## Cosa scopre il bambino

8 molecole, dalla più semplice (H₂) alla più ricca (CH₄ metano):

| Atomi necessari | Risultato | Cosa fa |
|---|---|---|
| 2 H | 🎈 Palloncino | Vola via |
| 2 O | 🌬️ Aria che respiri | Brilla |
| H + H + O | 💧 Acqua | Cade |
| C + O + O | 💨 Aria che esci | Sale |
| C + 4 H | 🔥 Fiamma (metano) | Brucia |
| N + 3 H | 🧴 Puzzino (ammoniaca) | Frizza |
| Na + Cl | 🧂 Sale | Cristallizza |
| 2 H + 2 O | 🫧 Acqua frizzante | Bollicine |

Ogni scoperta mostra anche la **forma geometrica** della molecola — cross-reference con il futuro gioco di geometria.

## Integrazione

```bash
cp -r laboratorio app/giochi/

# Add alla home dell'app:
# {
#   emoji: '🧪',
#   title: 'Laboratorio',
#   subtitle: 'Combina gli atomi',
#   href: '/giochi/laboratorio',
# }
```

Dipendenze: `framer-motion` (già necessario per Pongo).

## Struttura

```
laboratorio/
├── page.tsx
├── _components/
│   ├── Laboratorio.tsx        # Orchestratore (useReducer)
│   ├── AtomBall.tsx           # IL componente chiave: pallina con manine pulsanti
│   ├── StageAtom.tsx          # Atomo trascinabile nell'area
│   ├── AtomPalette.tsx        # Barra in basso, tap per spawn
│   └── DiscoveryPopup.tsx     # Wow! Nuova molecola scoperta
├── _data/
│   └── atoms.ts               # 6 atomi, 8 molecole, valenze, cross-ref forme
├── _hooks/
│   └── useDrag.ts             # Drag unificato (riusabile in geometria)
└── _lib/
    └── composition.ts         # ⭐ Astrazione condivisa col gioco di geometria
```

## Il modulo astratto condiviso (`_lib/composition.ts`)

Definisce le primitive **comuni a entrambi i giochi gemelli**:

- `PieceInstance` — un pezzo (atomo o forma geometrica) con `freeSlots` e `bonds`
- `computeStatus()` — calcola se la composizione è stabile (tutte manine occupate / lati chiusi / angoli compatibili)
- `fingerprint()` — composizione canonica per matching

Il gioco di geometria userà la **stessa libreria**, con `freeSlots` = "vertici liberi" o "lati liberi". Da qui la simmetria profonda: una sola grammatica, due materie.

## Note di design

**Perché i legami sono automatici a vicinanza?**
A 5-7 anni la coordinazione fine non è ancora perfetta. Pretendere di "trascinare la manina A sulla manina B" frustra. Avvicinare due palline è un gesto ampio, riproducibile, e *insegna comunque* la regola: "sono vicini → si tengono per mano".

**Perché niente "errore"?**
Se manca una manina, il contatore mostra "Manine libere: N" e basta. Niente X rosse, niente "sbagliato". Il bambino aggiunge un atomo e prova. Il sistema è auto-correttivo per design.

**Perché +3⭐ per nuova scoperta e +1 per rifarla?**
Premiare l'esplorazione senza punire la ripetizione (i bambini *amano* rifare le cose che funzionano, e va bene così).

**Perché il pulsante "Ricomincia"?**
Per liberare lo stage senza completare una molecola. Frequente quando il bambino prova combinazioni curiose.

## Punti delicati / cose da testare

- **Distanza di legame (`BOND_DISTANCE = 95px`)**: tarata per dito medio adulto, potrebbe servire un po' più larga per bambino. Vedere in produzione.
- **Spawn position**: ora spawna in area random centrale. Si può migliorare facendo apparire l'atomo *dove il dito ha toccato il palette*, ma servirebbe convertire coord schermo → coord stage.
- **Performance con molti atomi sullo stage**: testato fino a ~12 atomi, fluido. Se i bambini ne accumulano 30, valutare canvas o memoizzazione.

## Cross-reference col gemello

Quando arriverà il gioco di Geometria, le molecole scoperte qui mostreranno la loro forma (acqua = V, metano = tetraedro) e il bambino, vedendola nell'altro gioco, **riconoscerà**. Questo è il punto.
