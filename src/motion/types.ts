export interface MotionContext {
  /** True when the visitor asked the OS for reduced motion. Modules must respect it. */
  reducedMotion: boolean;
  /** True only for the first page of a visit; false after client-side navigations. */
  firstLoad: boolean;
}

export type Cleanup = () => void;

/**
 * A motion module animates one element. It receives the element carrying
 * `data-motion="<name>"` and returns an optional cleanup.
 * Content must already be visible without the module: motion only enhances.
 */
export type MotionModule = (el: HTMLElement, ctx: MotionContext) => Cleanup | void;
