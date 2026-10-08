import { registry } from './registry';
import { ScrollTrigger } from './gsap';
import { resetSmoothScroll, startSmoothScroll } from './scroll';
import { spotlightHash, startSpotlight } from './spotlight';
import type { Cleanup, MotionContext } from './types';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let firstLoad = true;
let teardown: Cleanup | null = null;

/**
 * Finds every `[data-motion]` element, lazy-loads the named modules and runs
 * them. Several names can share one element: data-motion="materialize bubbles".
 * Returns a cleanup that tears everything down.
 */
async function runModules(root: ParentNode, ctx: MotionContext): Promise<Cleanup> {
  const cleanups: Cleanup[] = [];
  const elements = root.querySelectorAll<HTMLElement>('[data-motion]');

  const runs = Array.from(elements).flatMap((el) =>
    (el.dataset['motion'] ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map(async (name) => {
        const load = registry[name];
        if (!load) {
          if (import.meta.env.DEV) console.warn(`[motion] unknown module "${name}"`, el);
          return;
        }
        const { default: run } = await load();
        const cleanup = run(el, ctx);
        if (cleanup) cleanups.push(cleanup);
      }),
  );

  await Promise.all(runs);
  return () => cleanups.splice(0).forEach((fn) => fn());
}

async function onPageLoad(): Promise<void> {
  teardown?.();
  if (!reducedMotion) startSmoothScroll();
  if (!firstLoad) resetSmoothScroll();

  teardown = await runModules(document, { reducedMotion, firstLoad });
  ScrollTrigger.refresh();
  // Arrived via a link to something on this page (e.g. /about#contact): glide + spotlight.
  if (location.hash) void spotlightHash(false);
  firstLoad = false;

  // The boot class only hides glass until the entrance takes over; drop it.
  document.documentElement.classList.remove('motion-boot');
}

/**
 * Boot the motion layer. Works with Astro's <ClientRouter />: modules re-run
 * on every page load and are torn down before each swap.
 */
export function startMotion(): void {
  startSpotlight();
  document.addEventListener('astro:page-load', () => void onPageLoad());
  document.addEventListener('astro:before-swap', () => {
    teardown?.();
    teardown = null;
  });
}
