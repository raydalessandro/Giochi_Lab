import { NextResponse } from 'next/server';

// Proxy verso Freesound — la chiave resta sul server.
// Auth: token-based (basta la API key, niente OAuth per leggere/preview).
// Attribution: dipende dalla licenza; restituiamo license + author + source_url
// così il client può decidere come attribuire.

const FREESOUND_URL = 'https://freesound.org/apiv2/search/text/';

type FreesoundResult = {
  id: number;
  name: string;
  duration: number;
  license: string;
  username: string;
  url: string;
  previews?: {
    'preview-hq-mp3'?: string;
    'preview-lq-mp3'?: string;
  };
};

export async function GET(request: Request) {
  const key = process.env.FREESOUND_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: 'FREESOUND_API_KEY not configured on server' },
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

  const maxDuration = Math.min(30, Math.max(0.1, Number(searchParams.get('max_duration') ?? 3)));
  const pageSize = Math.min(10, Math.max(1, Number(searchParams.get('page_size') ?? 5)));

  const url = new URL(FREESOUND_URL);
  url.searchParams.set('query', q);
  url.searchParams.set('token', key);
  url.searchParams.set('fields', 'id,name,previews,license,duration,username,url');
  url.searchParams.set('filter', `duration:[0 TO ${maxDuration}]`);
  url.searchParams.set('page_size', String(pageSize));
  url.searchParams.set('sort', 'rating_desc');

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return NextResponse.json(
        { error: 'freesound upstream error', status: res.status },
        { status: 502 }
      );
    }

    const data = (await res.json()) as { results?: FreesoundResult[] };
    const sounds = (data.results ?? [])
      .map((s) => ({
        id: s.id,
        name: s.name,
        duration: s.duration,
        preview_mp3: s.previews?.['preview-hq-mp3'] ?? s.previews?.['preview-lq-mp3'] ?? null,
        license: s.license,
        author: s.username,
        source_url: s.url,
      }))
      .filter((s) => s.preview_mp3 !== null);

    return NextResponse.json(
      { sounds, source: 'freesound' as const },
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
