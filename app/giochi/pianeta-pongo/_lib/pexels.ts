import 'server-only';

// Client Pexels server-side: usato dai page.tsx delle scene continente per
// pre-fetchare le foto degli animali al build (e poi ogni 24h via revalidate).
// La env var PEXELS_API_KEY non lascia mai il server.

const PEXELS_URL = 'https://api.pexels.com/v1/search';

export type PexelsPhoto = {
  id: number;
  url: string;
  thumbnail: string;
  large: string;
  width: number;
  height: number;
  alt: string;
  photographer: string;
  photographer_url: string;
  source_url: string;
};

type PexelsApiPhoto = {
  id: number;
  url: string;
  photographer: string;
  photographer_url: string;
  width: number;
  height: number;
  alt?: string;
  src: { small: string; medium: string; large: string };
};

export async function searchPexels(
  query: string,
  options: { perPage?: number; orientation?: 'landscape' | 'portrait' | 'square' } = {}
): Promise<PexelsPhoto[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];

  const url = new URL(PEXELS_URL);
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', String(options.perPage ?? 3));
  url.searchParams.set('orientation', options.orientation ?? 'landscape');

  try {
    const res = await fetch(url, {
      headers: { Authorization: key },
      // 24h: rinfresca le foto una volta al giorno senza burnare quota
      next: { revalidate: 86400 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: PexelsApiPhoto[] };
    return (data.photos ?? []).map((p) => ({
      id: p.id,
      url: p.src.medium,
      thumbnail: p.src.small,
      large: p.src.large,
      width: p.width,
      height: p.height,
      alt: p.alt || query,
      photographer: p.photographer,
      photographer_url: p.photographer_url,
      source_url: p.url,
    }));
  } catch {
    return [];
  }
}

/**
 * Pesca UNA sola foto per query — la prima del top-rated. Comoda per gli
 * usi 1:1 (un animale, una foto).
 */
export async function searchPexelsOne(
  query: string,
  options?: { orientation?: 'landscape' | 'portrait' | 'square' }
): Promise<PexelsPhoto | null> {
  const photos = await searchPexels(query, { ...options, perPage: 1 });
  return photos[0] ?? null;
}
