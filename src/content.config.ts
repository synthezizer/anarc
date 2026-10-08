import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Work: anything you've made. One Markdown/MDX file per entry in src/content/work/.
 * Files starting with "_" are ignored, so you can park drafts there.
 */
const work = defineCollection({
  loader: glob({ base: './src/content/work', pattern: '**/[^_]*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      tags: z.array(z.string()).default([]),
      cover: image().optional(),
      coverAlt: z.string().optional(),
      links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
      featured: z.boolean().default(false),
      /** Shown as a candy status card in the projects panel. */
      status: z.enum(['shipped', 'working', 'archived']).default('shipped'),
      /** Landing page or repo. Projects panel links here (with a redirect prompt). */
      url: z.url().optional(),
      draft: z.boolean().default(false),
    }),
});

/**
 * Updates: short status-style posts for the home feed. One Markdown file each in
 * src/content/updates/. The body is the post text. Files starting with "_" are ignored.
 */
const updates = defineCollection({
  loader: glob({ base: './src/content/updates', pattern: '**/[^_]*.md' }),
  schema: z.object({
    date: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

/**
 * Beats: optional entries for the vault player (title, order, cover).
 * `file` is the audio path, e.g. /src/assets/beats/night-drive.mp3. Audio files
 * in src/assets/beats without an entry still play, titled from their file name.
 */
const beats = defineCollection({
  loader: glob({ base: './src/content/beats', pattern: '**/[^_]*.{md,json}' }),
  schema: z.object({
    title: z.string(),
    file: z.string(),
    order: z.number().default(100),
    cover: z.string().optional(),
  }),
});

export const collections = { work, updates, beats };
