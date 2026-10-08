import type { MotionModule } from './types';

/**
 * Name → lazy module. Each module is its own chunk, so a page only downloads
 * the motion it actually uses. Add an effect = add a file + one line here.
 */
export const registry: Record<string, () => Promise<{ default: MotionModule }>> = {
  materialize: () => import('./modules/materialize'),
  'banner-drift': () => import('./modules/banner-drift'),
  bubbles: () => import('./modules/bubbles'),
};
