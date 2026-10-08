import type { IconDefinition } from '@fortawesome/fontawesome-common-types';
import {
  faBandcamp,
  faDiscord,
  faGithub,
  faInstagram,
  faSoundcloud,
  faSpotify,
  faTiktok,
  faTwitch,
  faXTwitter,
  faYoutube,
  faApple,
} from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faLink } from '@fortawesome/free-solid-svg-icons';

/** Picks a Font Awesome icon for a link from its URL. Unknown sites get a generic link icon. */
export function iconForHref(href: string): IconDefinition {
  if (href.startsWith('mailto:')) return faEnvelope;
  const host = (() => {
    try {
      return new URL(href).hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  })();

  const byHost: [string, IconDefinition][] = [
    ['spotify.com', faSpotify],
    ['soundcloud.com', faSoundcloud],
    ['bandcamp.com', faBandcamp],
    ['music.apple.com', faApple],
    ['youtube.com', faYoutube],
    ['youtu.be', faYoutube],
    ['instagram.com', faInstagram],
    ['tiktok.com', faTiktok],
    ['x.com', faXTwitter],
    ['twitter.com', faXTwitter],
    ['twitch.tv', faTwitch],
    ['discord.gg', faDiscord],
    ['discord.com', faDiscord],
    ['github.com', faGithub],
  ];

  return byHost.find(([domain]) => host === domain || host.endsWith(`.${domain}`))?.[1] ?? faLink;
}
