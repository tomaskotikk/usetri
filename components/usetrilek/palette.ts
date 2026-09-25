/**
 * Ušetřík's colours — exactly the web mascot's (components/illustrations/Mascot.tsx):
 * flat fills, no gradients, so he reads as the logo's green dot come to life.
 */
export const BODY = '#00d99a'
export const BODY_DARK = '#00b885'
export const BODY_LIGHT = '#7cf3ce'
/** A shade below the arms, for the creases of a fist. */
export const BODY_DEEP = '#009a6f'
export const INK = '#050b1a'
export const CYAN = '#4ec8ff'
export const TONGUE = '#ff6b5e'
export const TONGUE_LINE = '#d8483d'
export const WHITE = '#ffffff'
export const NAVY = '#1b2847'

/** Confetti and the little things around him. */
export const YELLOW = '#ffd23f'
export const CORAL = '#ff7a6b'
export const LILAC = '#b388ff'
export const HEART = '#ff6b7d'

/** The swatches the showcase page lists. */
export const SWATCHES = [
  { name: 'Tělo', hex: BODY },
  { name: 'Ruce a nohy', hex: BODY_DARK },
  { name: 'Odlesk', hex: BODY_LIGHT },
  { name: 'Oči a pusa', hex: INK },
  { name: 'Jiskřička', hex: CYAN },
  { name: 'Jazyk', hex: TONGUE },
] as const
