import { getCollection, type CollectionEntry } from 'astro:content';

export type WorkEntry = CollectionEntry<'work'>;

/** Published work, newest first. Drafts show in dev, never in production builds. */
export async function getWork(): Promise<WorkEntry[]> {
  const entries = await getCollection('work', ({ data }) => import.meta.env.DEV || !data.draft);
  return entries.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
}

/** Featured projects: entries marked `featured: true`, newest first (max 8). */
export async function getFeatured(): Promise<WorkEntry[]> {
  return (await getWork()).filter((entry) => entry.data.featured).slice(0, 8);
}

/** "Oct 7, 2026" */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en', { year: 'numeric', month: 'short', day: 'numeric' });
}

/** "10/7/2026", the old profile-page way. */
export function formatShortDate(date: Date): string {
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}
