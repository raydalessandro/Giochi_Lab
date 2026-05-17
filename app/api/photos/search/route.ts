import { NextResponse } from 'next/server';

// Proxy verso Pexels — la chiave resta sul server, mai esposta al client.
// Free tier: 200 req/h, 20k req/mese.
// Attribution obbligatoria: il client deve mostrare photographer + link a source_url.

const PEXELS_URL = 'https://api.pexels.com/v1/search';

type PexelsPhoto = {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  alt: string;
  src: {
    small: string;
    medium: string;
    large: string;
  };
};

export async function GET(request: Request) {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'PEXELS_API_KEY not configured on server' },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q')?.trim();
  if (!q) {
    return NextResponse.json({ error: 'missing q param' }, { status: 400 });
  }
  if (q.length > 100) {
    return NextResponse.json({ error: 'q too long' }, { status: 400 });
  }

  const perPage = Math.min(10, Math.max(1, Number(searchParams.get('per_page') ?? 5)));
  const orientation = searchParams.get('orientation') ?? 'landscape';

  const url = new URL(PEXELS_URL);
  url.searchParams.set('query', q);
  url.searchParams.set('per_page', String(perPage));
  if (orientation === 'landscape' || orientation === 'portrait' || orientation === 'square') {
    url.searchParams.set('orientation', orientation);
  }

  try {
    const res = await fetch(url, {
      headers: { Authorization: key },
      // Next data cache: stessa query → stessa risposta per 1h
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'pexels upstream error', status: res.status },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { photos?: PexelsPhoto[] };
    const photos = (data.photos ?? []).map((p) => ({
      id: p.id,
      url: p.src.medium,
      thumbnail: p.src.small,
      large: p.src.large,
      width: p.width,
      height: p.height,
      alt: p.alt || q,
      photographer: p.photographer,
      photographer_url: p.photographer_url,
      source_url: p.url,
    }));

    return NextResponse.json(
      { photos, source: 'pexels' as const },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
      }
    );
  } catch {
    return NextResponse.json({ error: 'fetch failed' }, { status: 502 });
  }
}
