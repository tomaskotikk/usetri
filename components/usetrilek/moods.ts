import { POSES, type PoseDef } from './poses'

/**
 * What the rest of the product asks of Ušetřík: a mood and, maybe, something in his
 * hand. Each combination is a playlist of poses from the library — the pose that
 * says the mood comes back again and again, with others in between — so wherever
 * he stands he keeps doing something new without ever changing what he means.
 */
export type MascotMood = 'idle' | 'wave' | 'cheer' | 'search' | 'sleep' | 'hang' | 'think' | 'sit' | 'music'
export type MascotHolds = 'coin' | 'bag'

/** A pose from the library and how long he holds it, in seconds — whole cycles of its motion where it can. */
export type Beat = readonly [id: string, seconds: number]

const LISTS: Record<string, readonly Beat[]> = {
  idle: [['stoji', 7.6], ['ahoj', 5.4], ['stoji', 7.6], ['palec', 4.8], ['stoji', 7.6], ['posloucha', 6]],
  'idle+coin': [['mince', 7.2], ['stoji', 7.6], ['mince', 4.8], ['palec', 4.8]],
  'idle+bag': [['nese', 6.5], ['palec', 4.8], ['nese', 6.5], ['hura', 5.7]],
  wave: [['ahoj', 5.4], ['palec', 4.8], ['ahoj', 5.4], ['zve', 5.7], ['ahoj', 5.4], ['hura', 3.8]],
  'wave+coin': [['ahoj', 5.4], ['mince', 7.2], ['palec', 4.8]],
  'wave+bag': [['ahoj', 5.4], ['nese', 6.5], ['palec', 4.8]],
  cheer: [['hura', 5.7], ['palec', 4.8], ['hura', 5.7], ['zve', 5.7]],
  'cheer+coin': [['mince', 7.2], ['hura', 5.7], ['mince', 4.8], ['palec', 4.8]],
  'cheer+bag': [['nese', 6.5], ['hura', 5.7], ['palec', 4.8]],
  search: [['hleda', 7.6], ['premysli', 5.6], ['hleda', 7.6], ['ukazuje', 5.6]],
  think: [['premysli', 11.2], ['krci', 6], ['premysli', 5.6], ['hleda', 7.6]],
  sleep: [['spi', 15], ['stoji', 3.8]],
  hang: [['visi', 8.8]],
  // One pose each: sitting on the pile is the whole picture, and so are the headphones.
  sit: [['sedi', 9]],
  music: [['posloucha', 12]],
}

export function playlist(mood: MascotMood, holds?: MascotHolds): readonly Beat[] {
  if (holds) return LISTS[`${mood}+${holds}`] ?? LISTS[`idle+${holds}`]
  return LISTS[mood] ?? LISTS.idle
}

const byId = new Map(POSES.map((d) => [d.id, d]))
export const poseById = (id: string): PoseDef => byId.get(id) ?? byId.get('stoji')!

/** A small, stable number from a string, so each figure on a page changes pose at its own moment. */
export function jitter(seed: string, range: number) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0
  return (Math.abs(h) % 1000) / 1000 * range
}
