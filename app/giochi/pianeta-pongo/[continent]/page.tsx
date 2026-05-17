import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CONTINENTS, getContinent, isContinentId } from '../_data/continents';
import { searchPexelsOne, type PexelsPhoto } from '../_lib/pexels';
import ContinentScene, { type AnimalPhotos } from './_components/ContinentScene';

type Params = { continent: string };

// Pre-render le 7 pagine al build (Africa fetcha foto, gli altri 6 no — gli
// animali degli altri restano emoji finché non li curiamo nei prossimi step).
export function generateStaticParams() {
  return CONTINENTS.map((c) => ({ continent: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { continent } = await params;
  if (!isContinentId(continent)) {
    return { title: 'Continente non trovato' };
  }
  const c = getContinent(continent);
  return {
    title: `${c.flag} ${c.name} — Pianeta di Pongo`,
    description: `Scopri ${c.name}: animali, habitat, cibi tipici.`,
  };
}

async function loadAnimalPhotos(
  animals: { name: string; searchQuery?: string }[]
): Promise<AnimalPhotos> {
  // Fetch in parallelo. Se PEXELS_API_KEY non è settata o la chiamata
  // fallisce, ogni entry resta null e l'UI usa l'emoji fallback.
  const results = await Promise.all(
    animals.map(async (a) => {
      if (!a.searchQuery) return [a.name, null] as const;
      const photo = await searchPexelsOne(a.searchQuery, { orientation: 'square' });
      return [a.name, photo] as const;
    })
  );
  const map: AnimalPhotos = {};
  for (const [name, photo] of results) {
    map[name] = photo;
  }
  return map;
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const { continent } = await params;
  if (!isContinentId(continent)) notFound();
  const c = getContinent(continent);

  // Per ora solo Africa ha searchQuery sui suoi animali → solo Africa fa
  // fetch. Gli altri continenti ritornano subito una map vuota.
  const animalPhotos = await loadAnimalPhotos(c.animals);

  return <ContinentScene continent={c} animalPhotos={animalPhotos} />;
}
