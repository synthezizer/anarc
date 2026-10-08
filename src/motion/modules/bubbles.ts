import { gsap } from '../gsap';
import type { MotionModule } from '../types';

/**
 * Ambient Aero bubbles drifting up the sky behind everything. Each starts at a
 * random point in its rise so the layer looks settled on every page. Paused
 * while the tab is hidden; never runs under reduced motion.
 */
const bubbles: MotionModule = (el, ctx) => {
  if (ctx.reducedMotion) return;

  const { random } = gsap.utils;
  const height = window.innerHeight;

  const loops = Array.from(el.children as HTMLCollectionOf<HTMLElement>).map((bubble) => {
    const size = random(12, 64);
    gsap.set(bubble, {
      width: size,
      height: size,
      left: `${random(2, 96)}%`,
      y: height + size,
      x: 0,
      opacity: random(0.4, 0.85),
    });

    const rise = gsap.timeline({ repeat: -1 });
    rise.to(bubble, { y: -size * 2, duration: random(26, 44), ease: 'none' }, 0);
    rise.to(bubble, { x: random(-36, 36), duration: random(5, 8), ease: 'sine.inOut', yoyo: true, repeat: 9 }, 0);
    rise.progress(random(0, 1));
    return rise;
  });

  const onVisibility = () => loops.forEach((loop) => (document.hidden ? loop.pause() : loop.resume()));
  document.addEventListener('visibilitychange', onVisibility);

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    loops.forEach((loop) => loop.kill());
  };
};

export default bubbles;
