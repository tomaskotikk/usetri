/**
 * The little loops around Ušetřílek — confetti falling, notes rising, coins
 * floating — as Web Animations with plain numbers in them. (CSS animations that
 * read custom properties in their keyframes don't reach the GPU in Chrome; these
 * do.) Distances are percentages of the item's own box, so they scale with it.
 */

export type Drift =
  | { kind: 'float'; dur: number; delay?: number; amp?: number }
  | { kind: 'twinkle'; dur: number; delay?: number }
  | { kind: 'rise'; dur: number; delay?: number; dx?: number }
  | { kind: 'fall'; dur: number; delay?: number; dx?: number; spin?: number }

export function driftFrames(d: Drift): Keyframe[] {
  switch (d.kind) {
    case 'float': {
      const amp = d.amp ?? -8
      return [
        { transform: 'translateY(0%)', easing: 'ease-in-out' },
        { transform: `translateY(${amp}%)`, offset: 0.5, easing: 'ease-in-out' },
        { transform: 'translateY(0%)' },
      ]
    }
    case 'twinkle':
      return [
        { transform: 'scale(1) rotate(0deg)', opacity: 1, easing: 'ease-in-out' },
        { transform: 'scale(0.55) rotate(45deg)', opacity: 0.45, offset: 0.5, easing: 'ease-in-out' },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ]
    case 'rise':
      return [
        { transform: 'translate(0%, 0%) scale(0.5)', opacity: 0, easing: 'cubic-bezier(.25,.6,.4,1)' },
        { transform: `translate(${(d.dx ?? 0) * 0.18}%, -58%) scale(0.68)`, opacity: 1, offset: 0.18, easing: 'cubic-bezier(.25,.6,.4,1)' },
        { transform: `translate(${(d.dx ?? 0) * 0.7}%, -224%) scale(0.95)`, opacity: 1, offset: 0.7, easing: 'cubic-bezier(.25,.6,.4,1)' },
        { transform: `translate(${d.dx ?? 0}%, -320%) scale(1.1)`, opacity: 0 },
      ]
    case 'fall':
      return [
        { transform: 'translate(0%, -150%) rotate(0deg)', opacity: 0 },
        { transform: `translate(${(d.dx ?? 100) * 0.12}%, ${-150 + 1850 * 0.12}%) rotate(${(d.spin ?? 300) * 0.12}deg)`, opacity: 1, offset: 0.12 },
        { transform: `translate(${(d.dx ?? 100) * 0.8}%, ${-150 + 1850 * 0.8}%) rotate(${(d.spin ?? 300) * 0.8}deg)`, opacity: 1, offset: 0.8 },
        { transform: `translate(${d.dx ?? 100}%, 1700%) rotate(${d.spin ?? 300}deg)`, opacity: 0 },
      ]
  }
}

/** Starts a drift on an element; returns the animation so the caller can pause or cancel it. */
export function startDrift(el: HTMLElement, d: Drift): Animation {
  return el.animate(driftFrames(d), {
    duration: d.dur * 1000,
    // Starts part-way through its cycle, so a row of them isn't in step.
    delay: -(d.delay ?? 0) * 1000,
    iterations: Infinity,
    easing: 'linear',
  })
}
