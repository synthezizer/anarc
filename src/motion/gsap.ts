import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register plugins once; every module imports gsap from here.
gsap.registerPlugin(ScrollTrigger);

/** Shared easing: confident deceleration, no bounce. */
export const EASE = 'expo.out';

export { gsap, ScrollTrigger };
