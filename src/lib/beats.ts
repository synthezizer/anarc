import { getCollection } from 'astro:content';

/**
 * Beats for the vault player. Two sources, merged:
 *  1. Entries in src/content/beats (made in /admin): title, order, cover.
 *  2. Any audio file in src/assets/beats with no entry, titled from its file name
 *     ("01 night_drive.mp3" → "night drive") and ordered by file name.
 */

export interface Beat {
  title: string;
  src: string;
  cover?: string;
}

const audio = import.meta.glob<string>('/src/assets/beats/*.{mp3,m4a,aac,ogg,oga,opus,wav,flac,webm}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const images = import.meta.glob<string>('/src/assets/beats/*.{jpg,jpeg,png,webp,avif,gif}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const baseName = (path: string) => path.split('/').pop()?.replace(/\.[^.]+$/, '') ?? path;

const toTitle = (name: string) =>
  name
    .replace(/^\d+\s*[-_.)]*\s*/, '')
    .replace(/[-_]+/g, ' ')
    .trim() || name;

/** Normalise "src/assets/x", "/src/assets/x" or "../../assets/x" to the glob key. */
const key = (path: string) => '/src/assets/' + path.replace(/^.*?assets\//, '');

const coverByName = new Map(Object.entries(images).map(([path, url]) => [baseName(path), url]));

export async function getBeats(): Promise<Beat[]> {
  const entries = (await getCollection('beats')).sort((a, b) => a.data.order - b.data.order);
  const used = new Set<string>();

  const fromEntries: Beat[] = entries.flatMap((entry) => {
    const path = key(entry.data.file);
    const src = audio[path];
    if (!src) return [];
    used.add(path);
    const cover = entry.data.cover ? images[key(entry.data.cover)] : coverByName.get(baseName(path));
    return [cover ? { title: entry.data.title, src, cover } : { title: entry.data.title, src }];
  });

  const loose: Beat[] = Object.entries(audio)
    .filter(([path]) => !used.has(path))
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([path, src]) => {
      const name = baseName(path);
      const cover = coverByName.get(name);
      return cover ? { title: toTitle(name), src, cover } : { title: toTitle(name), src };
    });

  return [...fromEntries, ...loose];
}
