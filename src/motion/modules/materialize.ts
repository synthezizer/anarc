import { EASE, gsap, ScrollTrigger } from '../gsap';
import type { MotionModule } from '../types';

/**
 * The focal entrance: every [data-glass] surface inside the element condenses
 * out of the sky (blurred and transparent to crisp glass), cascading in
 * reading order, and a glint sweeps across its gloss bar as it lands.
 * Surfaces below the fold condense when they scroll in.
 * Runs once per visit; later navigations and reduced motion show glass as-is.
 */
const materialize: MotionModule = (el, ctx) => {
  const glass = Array.from(el.querySelectorAll<HTMLElement>('[data-glass]'));
  if (glass.length === 0) return;

  if (ctx.reducedMotion || !ctx.firstLoad) {
    gsap.set(glass, { autoAlpha: 1 });
    return;
  }

  gsap.set(glass, { autoAlpha: 0 });

  const readingOrder = (a: HTMLElement, b: HTMLElement) => {
    const ra = a.getBoundingClientRect();
    const rb = b.getBoundingClientRect();
    return Math.abs(ra.top - rb.top) > 24 ? ra.top - rb.top : ra.left - rb.left;
  };

  // The first batch waits for the banner's fade to get going.
  let lead = 0.45;

  const land = (batch: HTMLElement[]) => {
    const ordered = [...batch].sort(readingOrder);
    const delay = lead;
    lead = 0;

    gsap.fromTo(
      ordered,
      { autoAlpha: 0, y: 22, scale: 0.97, filter: 'blur(12px)' },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
        duration: 1,
        ease: EASE,
        stagger: 0.09,
        delay,
        clearProps: 'transform,filter',
      },
    );

    ordered.forEach((surface, i) => {
      const bar = surface.querySelector<HTMLElement>('[data-sheen]') ?? (surface.hasAttribute('data-sheen') ? surface : null);
      if (!bar) return;
      gsap.fromTo(
        bar,
        { '--sheen': '-120%' },
        {
          '--sheen': '220%',
          duration: 1.2,
          ease: 'power2.inOut',
          delay: delay + 0.35 + i * 0.09,
          // Hand the property back to CSS so the hover glint still works.
          onComplete: () => bar.style.removeProperty('--sheen'),
        },
      );
    });
  };

  // Glass already on screen lands now; only what's below the fold waits for scroll.
  const fold = window.innerHeight * 0.96;
  const inView = glass.filter((g) => g.getBoundingClientRect().top < fold);
  const below = glass.filter((g) => !inView.includes(g));

  if (inView.length) land(inView);
  const triggers = below.length
    ? ScrollTrigger.batch(below, {
        start: 'top 96%',
        once: true,
        onEnter: (batch) => land(batch as HTMLElement[]),
      })
    : [];

  // Safety net: nothing may stay invisible if a trigger never fires.
  const failsafe = window.setTimeout(() => {
    const stuck = glass.filter(
      (g) =>
        getComputedStyle(g).visibility === 'hidden' &&
        !gsap.isTweening(g) &&
        g.getBoundingClientRect().top < window.innerHeight,
    );
    if (stuck.length) gsap.to(stuck, { autoAlpha: 1, duration: 0.4 });
  }, 6000);

  return () => {
    window.clearTimeout(failsafe);
    triggers.forEach((t) => t.kill());
    gsap.killTweensOf(glass);
    gsap.set(glass, { autoAlpha: 1, clearProps: 'transform,filter' });
  };
};

export default materialize;
