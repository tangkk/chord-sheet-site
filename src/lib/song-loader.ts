import fs from 'node:fs';
import path from 'node:path';

export type Song = {
  slug: string;
  title: string;
  artist: string;
  language?: string;
  originalKey: string;
  capo?: number;
  tags: string[];
  body: string;
};

const SONGS_DIR = path.join(process.cwd(), 'src', 'data');

function parseFrontmatter(raw: string): { meta: Record<string, unknown>; body: string } {
  if (!raw.startsWith('---')) {
    return { meta: {}, body: raw.trim() };
  }

  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    return { meta: {}, body: raw.trim() };
  }

  const [, frontmatter, body] = match;
  const lines = frontmatter.split(/\r?\n/);
  const meta: Record<string, unknown> = {};
  let currentArrayKey: string | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const arrayMatch = line.match(/^\s*-\s+(.*)$/);
    if (arrayMatch && currentArrayKey) {
      const existing = (meta[currentArrayKey] as string[]) ?? [];
      existing.push(arrayMatch[1].trim());
      meta[currentArrayKey] = existing;
      continue;
    }

    const pairMatch = line.match(/^([A-Za-z][A-Za-z0-9_]*)\s*:\s*(.*)$/);
    if (!pairMatch) continue;

    const [, key, valueRaw] = pairMatch;
    if (valueRaw === '') {
      meta[key] = [];
      currentArrayKey = key;
      continue;
    }

    currentArrayKey = null;
    if (/^\d+$/.test(valueRaw)) {
      meta[key] = Number(valueRaw);
    } else {
      meta[key] = valueRaw;
    }
  }

  return { meta, body: body.trimEnd() };
}

export function getSongs(): Song[] {
  if (!fs.existsSync(SONGS_DIR)) return [];

  return fs
    .readdirSync(SONGS_DIR)
    .filter((file) => file.endsWith('.md'))
    .map((file) => {
      const raw = fs.readFileSync(path.join(SONGS_DIR, file), 'utf8');
      const { meta, body } = parseFrontmatter(raw);
      const slug = file.replace(/\.md$/, '');

      return {
        slug,
        title: String(meta.title ?? slug),
        artist: String(meta.artist ?? ''),
        language: meta.language ? String(meta.language) : undefined,
        originalKey: String(meta.originalKey ?? 'C'),
        capo: typeof meta.capo === 'number' ? meta.capo : undefined,
        tags: Array.isArray(meta.tags) ? meta.tags.map(String) : [],
        body,
      } satisfies Song;
    });
}

export function getSongBySlug(slug: string): Song | undefined {
  return getSongs().find((song) => song.slug === slug);
}
