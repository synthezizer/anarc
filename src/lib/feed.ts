import { getCollection, type CollectionEntry } from 'astro:content';
import { getWork, type WorkEntry } from './work';

export type UpdateEntry = CollectionEntry<'updates'>;

export type FeedEntry = { kind: 'work'; entry: WorkEntry; date: Date } | { kind: 'update'; entry: UpdateEntry; date: Date };

/** Home feed: status updates and new work together, newest first. */
export async function getFeed(limit = 10): Promise<FeedEntry[]> {
  const updates = await getCollection('updates', ({ data }) => import.meta.env.DEV || !data.draft);
  const work = await getWork();
  return [
    ...updates.map((entry) => ({ kind: 'update' as const, entry, date: entry.data.date })),
    ...work.map((entry) => ({ kind: 'work' as const, entry, date: entry.data.date })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, limit);
}
