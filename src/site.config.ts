/**
 * Identity, navigation and profile modules.
 * The editable values live in src/data/profile.json, which the /admin editor
 * changes for you. This file only shapes them for the components.
 */
import data from './data/profile.json';

export interface Link {
  label: string;
  href: string;
}

export const site = {
  domain: 'anarc.cc',
  url: 'https://anarc.cc',
  name: data.name,
  description: data.description,
  locale: 'en',
} as const;

export const nav: Link[] = [
  { label: 'Home', href: '/' },
  { label: 'Work', href: '/work' },
  { label: 'Profile', href: '/about' },
];

/** The profile modules on the home and about pages. */
export const profile = {
  /** Other names you go by, shown as "a.k.a." under your name. Empty list hides the row. */
  aliases: data.aliases as string[],
  mood: data.mood,
  headline: data.headline,
  location: data.location,
  aboutMe: data.aboutMe,
  wantToMeet: data.wantToMeet,
};

/** Where your music lives. Used by the vault player and the contact table. */
export const music = {
  spotify: data.spotify,
};

/** The "Contacting" table: Spotify first, then any links added in the editor. */
export const contact: Link[] = [
  ...(data.spotify ? [{ label: 'Spotify', href: data.spotify }] : []),
  ...(data.contact as Link[]),
];
