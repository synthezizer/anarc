import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { gsap, ScrollTrigger } from './gsap';

let lenis: Lenis | null = null;

/**
 * One Lenis instance for the whole visit, driven by GSAP's ticker so smooth
 * scroll and ScrollTrigger never disagree. Never started under reduced motion.
 */
export function startSmoothScroll(): Lenis | null {
  if (lenis) return lenis;

  lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 0.9 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

/** After a client-side navigation: re-measure and start at the top (spotlight handles #hash). */
export function resetSmoothScroll(): void {
  if (!lenis) return;
  lenis.resize();
  lenis.scrollTo(0, { immediate: true, force: true });
}

/**
 * Bring an element into view (smooth with Lenis, native otherwise) and resolve
 * once it has arrived. Offset keeps it clear of the viewport edge.
 */
export function scrollToElement(el: HTMLElement, immediate: boolean): Promise<void> {
  return new Promise((resolve) => {
    if (lenis) {
      // Lenis doesn't always report completion (e.g. right after a page swap),
      // so resolve on whichever comes first: arrival or the scroll's duration.
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve();
      };
      lenis.scrollTo(el, { offset: -24, immediate, duration: 0.9, force: true, onComplete: finish });
      window.setTimeout(finish, immediate ? 0 : 950);
      return;
    }
    el.scrollIntoView({ block: 'start', behavior: 'auto' });
    resolve();
  });
}
