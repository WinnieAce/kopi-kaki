import type { Ingredient } from '../content/schema'
import type { ResolvedLine } from './order'

export type CaffeineLevel = 'none' | 'low' | 'medium' | 'high'
export type Caffeine = {
  /** Milligrams per serving, unrounded. */
  mg: number
  level: CaffeineLevel
  /** "No caffeine" or "about N mg". */
  label: string
  /** True when all of it comes from cocoa, as in Milo: a trace, worth saying so. */
  fromCocoaOnly: boolean
}

export const LEVEL_NAMES: Record<CaffeineLevel, string> = {
  none: 'No caffeine',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const HIGH_CAFFEINE_NOTE =
  'Caffeine affects children more strongly. A Po order, a smaller cup or a caffeine-free drink may suit them better.'
/** The same note where Po cannot help: café drinks, drinks with no Po, and orders that are already Po. */
export const HIGH_CAFFEINE_NOTE_PLAIN =
  'Caffeine affects children more strongly. A smaller cup or a caffeine-free drink may suit them better.'
export const CAFFEINE_ESTIMATE_NOTE = 'Caffeine figures are estimates and vary by brand and brewing.'
export const COCOA_NOTE = 'A trace, from the cocoa.'

/** Judged on the unrounded figure, so 99.6 mg is Medium even though it reads "about 100 mg". */
export function levelOf(mg: number): CaffeineLevel {
  if (mg <= 0) return 'none'
  if (mg < 40) return 'low'
  if (mg < 100) return 'medium'
  return 'high'
}

/** Nearest 5 mg below 20 mg (never below 5), nearest 10 mg from there: estimates should not look precise. */
export function roundCaffeine(mg: number): number {
  if (mg < 20) return Math.max(5, Math.round(mg / 5) * 5)
  return Math.round(mg / 10) * 10
}

/** Caffeine in one serving of these lines, optional ones included. */
export function caffeineOf(lines: ResolvedLine[], byId: ReadonlyMap<string, Ingredient>): Caffeine {
  let mg = 0
  let fromCocoaOnly = true
  for (const line of lines) {
    const ingredient = byId.get(line.ingredientId)
    if (!ingredient || ingredient.caffeineMg === 0) continue
    mg += line.amount * ingredient.caffeineMg
    if (ingredient.category !== 'malt-and-chocolate') fromCocoaOnly = false
  }
  mg = Math.round(mg * 1e6) / 1e6
  const level = levelOf(mg)
  return {
    mg,
    level,
    label: level === 'none' ? 'No caffeine' : `about ${roundCaffeine(mg)} mg`,
    fromCocoaOnly: mg > 0 && fromCocoaOnly,
  }
}
