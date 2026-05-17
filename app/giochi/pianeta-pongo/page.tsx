import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { geoEqualEarth, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import PianetaPongo from './_components/PianetaPongo';
import type { ContinentPaths } from './_components/WorldMapReal';
import { continentOf } from './_lib/country-to-continent';
import type { ContinentId } from './_data/continents';

export const metadata = {
  title: '🌍 Il Pianeta di Pongo',
  description: 'Esplora il mondo con Pongo — continenti, animali, habitat',
};

type CountryFeature = Feature<Geometry, { name: string }>;

/**
 * Legge il topojson Natural Earth (~100KB) dal filesystem AL BUILD,
 * proietta ogni paese con d3-geo (Equal Earth, friendly per kids — niente
 * deformazioni Mercator), raggruppa per continente. Le path strings
 * risultanti vengono inlined nel client component, così il bundle client
 * non include d3-geo né topojson-client.
 */
function loadMapPaths(): ContinentPaths[] {
  const file = join(process.cwd(), 'public', 'world-110m.json');
  const topology = JSON.parse(readFileSync(file, 'utf-8')) as Topology<{
    countries: GeometryCollection<{ name: string }>;
  }>;
  const fc = feature(
    topology,
    topology.objects.countries
  ) as unknown as FeatureCollection<Geometry, { name: string }>;

  const projection = geoEqualEarth().scale(170).translate([500, 250]);
  const pathGen = geoPath(projection);

  const byContinent = new Map<ContinentId, string[]>();
  for (const f of fc.features as CountryFeature[]) {
    const continent = continentOf(f.properties.name);
    if (!continent) continue;
    const d = pathGen(f);
    if (!d) continue;
    const arr = byContinent.get(continent);
    if (arr) arr.push(d);
    else byContinent.set(continent, [d]);
  }

  return Array.from(byContinent.entries()).map(([continent, paths]) => ({
    continent,
    paths,
  }));
}

const MAP_PATHS = loadMapPaths();

export default function Page() {
  return <PianetaPongo mapPaths={MAP_PATHS} />;
}
