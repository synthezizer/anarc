import { gsap } from '../gsap';
import type { MotionModule } from '../types';

/**
 * As the page scrolls past the banner it sinks slightly slower than the page
 * and dims into the sky, so the glass columns visibly slide over it.
 */
const bannerDrift: MotionModule = (el, ctx) => {
  if (ctx.reducedMotion) return;

  const tween = gsap.to(el, {
    yPercent: 16,
    opacity: 0.5,
    ease: 'none',
    scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(el, { clearProps: 'transform,opacity' });
  };
};

export default bannerDrift;
