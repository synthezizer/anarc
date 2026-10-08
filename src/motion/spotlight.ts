import { scrollToElement } from './scroll';

/**
 * "Spotlight": when a link brings something into view (a #hash), glide to it,
 * then glow the target and sweep light across its gloss bar so the eye lands on it. Same-page hash links are
 * intercepted; cross-page ones are handled after the new page loads.
 */

const SPOTLIGHT_CLASS = 'spotlight';

/** (Re)play the spotlight on an element. */
export function spotlight(el: HTMLElement): void {
  el.classList.remove(SPOTLIGHT_CLASS);
  void el.offsetWidth; // reflow so the animation can replay
  el.classList.add(SPOTLIGHT_CLASS);
  el.addEventListener('animationend', (e) => e.target === el && el.classList.remove(SPOTLIGHT_CLASS));
}

function targetFor(hash: string): HTMLElement | null {
  if (!hash || hash === '#') return null;
  return document.getElementById(decodeURIComponent(hash.slice(1)));
}

/** Scroll to the current #hash target (if any) and spotlight it. */
export async function spotlightHash(immediate = false): Promise<void> {
  const target = targetFor(location.hash);
  if (!target) return;
  await scrollToElement(target, immediate);
  spotlight(target);
}

/** Intercept clicks on links that point at something on this same page. */
export function startSpotlight(): void {
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return;
    const link = (event.target as Element | null)?.closest('a[href*="#"]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname) return;
    const target = targetFor(url.hash);
    if (!target) return;

    event.preventDefault();
    history.pushState(history.state, '', url.hash);
    void scrollToElement(target, false).then(() => spotlight(target));
  }, true); // capture: run before Astro's router sees the click
}
