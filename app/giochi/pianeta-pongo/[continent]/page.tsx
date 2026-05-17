import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CONTINENTS, getContinent, isContinentId } from '../_data/continents';
import ContinentScene from './_components/ContinentScene';

type Params = { continent: string };

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

export default async function Page({ params }: { params: Promise<Params> }) {
  const { continent } = await params;
  if (!isContinentId(continent)) notFound();
  return <ContinentScene continent={getContinent(continent)} />;
}
