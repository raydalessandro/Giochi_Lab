import { CONTINENTS, type Continent, type Animal } from './continents';

export interface Mission {
  animal: Animal;
  correctContinent: Continent;
  hint: string;
}

/**
 * Genera una missione: un animale è "perso", il bambino deve trascinarlo
 * sul continente giusto. La missione viene generata casualmente ma in modo
 * che animali iconici (panda, canguro, leone, pinguino) escano più spesso
 * perché sono i più riconoscibili per la fascia 5-7.
 */
const ICONIC_ANIMALS = ['🐼', '🦘', '🦁', '🐧', '🐘', '🐨'];

export function generateMission(excludeContinentId?: string): Mission {
  // Filtra eventuali continenti da escludere (per non ripetere)
  const pool = excludeContinentId
    ? CONTINENTS.filter((c) => c.id !== excludeContinentId)
    : CONTINENTS;

  // 70% probabilità di pescare un animale iconico
  const useIconic = Math.random() < 0.7;

  const candidates: { animal: Animal; continent: Continent }[] = [];
  for (const c of pool) {
    for (const a of c.animals) {
      if (!useIconic || ICONIC_ANIMALS.includes(a.emoji)) {
        candidates.push({ animal: a, continent: c });
      }
    }
  }

  // Fallback se non ci sono iconici nel pool ridotto
  const finalPool = candidates.length > 0
    ? candidates
    : pool.flatMap((c) => c.animals.map((a) => ({ animal: a, continent: c })));

  const pick = finalPool[Math.floor(Math.random() * finalPool.length)];

  const hints = [
    `${pick.animal.name} si è perso! Riportalo a casa 🏠`,
    `Aiuta ${pick.animal.name} a tornare a casa!`,
    `Dove vive ${pick.animal.name}? Trascinalo a casa!`,
    `${pick.animal.name} cerca la sua famiglia. Aiutalo!`,
  ];

  return {
    animal: pick.animal,
    correctContinent: pick.continent,
    hint: hints[Math.floor(Math.random() * hints.length)],
  };
}
