'use client';

// Helper client-side per parlare con i nostri proxy /api/*.
// Le chiavi delle API esterne restano sul server, qui chiamiamo solo i nostri endpoint.

export type PhotoResult = {
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

export type SoundResult = {
  id: number;
  name: string;
  duration: number;
  preview_mp3: string;
  license: string;
  author: string;
  source_url: string;
};

export async function searchPhotos(
  query: string,
  options: { perPage?: number; orientation?: 'landscape' | 'portrait' | 'square' } = {}
): Promise<PhotoResult[]> {
  try {
    const params = new URLSearchParams({ q: query });
    if (options.perPage) params.set('per_page', String(options.perPage));
    if (options.orientation) params.set('orientation', options.orientation);
    const res = await fetch(`/api/photos/search?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { photos?: PhotoResult[] };
    return data.photos ?? [];
  } catch {
    return [];
  }
}

export async function searchSounds(
  query: string,
  options: { maxDuration?: number; pageSize?: number } = {}
): Promise<SoundResult[]> {
  try {
    const params = new URLSearchParams({ q: query });
    if (options.maxDuration !== undefined) params.set('max_duration', String(options.maxDuration));
    if (options.pageSize !== undefined) params.set('page_size', String(options.pageSize));
    const res = await fetch(`/api/sounds/search?${params.toString()}`);
    if (!res.ok) return [];
    const data = (await res.json()) as { sounds?: SoundResult[] };
    return data.sounds ?? [];
  } catch {
    return [];
  }
}
