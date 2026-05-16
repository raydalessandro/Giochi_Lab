# 🔧 Le Macchine Semplici

**Riscritto da zero.** Versione manipolativa: il bambino *sente* il vantaggio meccanico nelle sue dita, non guarda animazioni passive.

## Filosofia

> "Posso letteralmente dare più forza ai miei figli, se gli insegno le leve."

Le 6 macchine semplici della fisica classica (Archimede, Galileo) come **mini-puzzle manipolativi**. Il bambino:

1. Sceglie una macchina dal menu
2. Vede un'**indicatore di forza** in tempo reale (0-5 segmenti, verde→giallo→rosso)
3. Manipola lo strumento (slider, switch) e vede subito come cambia la forza richiesta
4. Quando trova una configurazione che gli dà abbastanza vantaggio, tiene premuto il pulsante "💪 SPINGO" e *guarda* l'azione succedere

Niente formule. Niente teoria. Solo: **"con queste impostazioni la mia forza basta o no?"**

## Le 6 macchine

| Macchina | Cosa fa | Vantaggio variabile da... | Esperienze reali |
|---|---|---|---|
| ⚖️ **Leva** | Solleva un masso | Posizione del fulcro | Porta, cucchiaio in barattolo, altalena |
| 📐 **Piano Inclinato** | Spingi su una cassa | Angolo della rampa | Rampe disabili, strade di montagna, forbici |
| ⚙️ **Carrucola** | Tira giù per sollevare | Numero di carrucole (1-3) | Bandiera, gru, ascensore |
| 🪓 **Cuneo** | Spacca un tronco | Spessore + lunghezza | Coltelli, denti, chiodi |
| 🔩 **Vite** | Solleva un'auto | Passo + lunghezza manovella | Martinetto, cavatappi |
| 🛞 **Ruota** | Sposta una cassa | Con/senza ruote | Bici, carrelli, skateboard |

## Pattern condiviso fra tutte le macchine

Ogni macchina ha la stessa **anatomia di interazione**:

1. **Header**: ← Indietro / Titolo / ? aiuto
2. **Selettore livelli** (dove applicabile): pesi crescenti per progressione
3. **Area di gioco SVG** con:
   - Visualizzazione fisica chiara (rampa, leva, carrucole...)
   - **ForceMeter** (top-left): segmenti colorati che mostrano la forza richiesta
   - **Vantaggio meccanico** (top-right): ×N
   - Pulsante "SPINGI" grande (verde se possibile, rosso se impossibile)
4. **Slider/switch** in basso per cambiare i parametri della macchina
5. **ConceptCard** all'apertura: spiega il principio + esempi del mondo reale

Lo stesso bambino impara a "leggere" l'interfaccia in 30 secondi e poi può girare per le macchine senza confusione.

## Fisica usata (vera ma semplificata)

In `_lib/physics.ts`:

- **Leva**: `F₂ = F₁·d₁/d₂` (legge della leva)
- **Piano inclinato**: `F = W·sin(θ)`
- **Carrucola**: `F = W/N` (N corde di sostegno)
- **Cuneo**: `F = R·(t/L)` (resistenza × spessore / lunghezza)
- **Vite**: `F = W·passo/(2π·R)`
- **Ruota**: solo qualitativo (attrito ridotto ~10×)

Le costanti sono tarate per fascia 5-7: `MAX_FORCE_KID = 10-15` (forza disponibile al bambino), pesi degli oggetti scalati in modo che il vantaggio meccanico sia *visibilmente necessario* per riuscirci.

## Integrazione

```bash
cp -r fisica app/giochi/

# Nella home:
# { emoji: '🔧', title: 'Macchine', subtitle: 'Super-forza per le tue mani', href: '/giochi/fisica' }
```

Dipendenze: `framer-motion`.

## Struttura

```
fisica/
├── page.tsx
├── _components/
│   ├── Fisica.tsx                      # Menu macchine + router
│   ├── machines/
│   │   ├── Leva.tsx                    ★ Completa, 4 livelli
│   │   ├── PianoInclinato.tsx          ★ Completa, 3 livelli
│   │   ├── Carrucola.tsx               ★ Completa, 3 livelli
│   │   ├── Cuneo.tsx                   2 slider (spessore, lunghezza)
│   │   ├── Vite.tsx                    2 slider (passo, manovella)
│   │   └── RuotaAsse.tsx               Switch con/senza
│   └── ui/
│       ├── ForceMeter.tsx              ⭐ Indicatore forza condiviso
│       └── ConceptCard.tsx             ⭐ Popup info condiviso
└── _lib/
    └── physics.ts                      Formule pure
```

## Cosa va bene da subito

- Le 6 macchine sono tutte **giocabili e didatticamente complete**
- Leva, Piano Inclinato, Carrucola hanno progressione a livelli
- Cuneo, Vite, Ruota sono "single playground" — sufficienti per capire il concetto

## Cosa aggiungeresti dopo aver testato coi tuoi figli

- **Sfide guidate** ("Solleva il pianoforte con meno di 15 di forza") che costringono a ottimizzare invece di forza brutta
- **Modalità Galileo**: stelle progressive per completamento, ma sempre opzionali
- **Sintesi finale**: la Macchina di Rube Goldberg che combina più macchine semplici (era la mia vecchia idea, sta meglio QUI come "boss finale" del gioco di fisica)
- **Cross-reference con Geometria**: nel piano inclinato c'è già `{angle}°` mostrato — più avanti puoi linkare alla Geometria ("È un triangolo rettangolo, vedi?")

## Punti di attenzione

- **`MAX_FORCE_KID`** è la calibrazione critica. Se vedi che i livelli "impossibili" sono troppo facili o troppo duri, è una costante per macchina, una riga di codice
- **Velocità di animazione**: tarata empiricamente. Se i bambini si annoiano ad aspettare, alza i `speed` nei `setInterval`. Se non capiscono cosa sta succedendo, abbassali
- **Touch targets**: i pulsanti "SPINGI" sono già grandi (px-12 py-4). Gli slider sono `h-3 accent-purple-600` — accessibili su touch ma potrebbero servire più alti per dita di 5enni. Vedere in produzione

## Roadmap (dopo deploy iniziale)

1. **Sfide guidate**: "Trova la configurazione ottima per sollevare X con meno di Y di forza"
2. **Combinatore**: una pagina extra dove combini due macchine (carrucola + leva = vantaggio moltiplicato)
3. **Storia di Archimede**: una mini-narrazione che racconta come queste macchine sono state inventate. Cultura, non solo fisica
4. **Esperimento casa**: ogni macchina ha un "fallo a casa" — istruzioni semplicissime per riprodurla con oggetti di casa. Il vero apprendimento si chiude lì
