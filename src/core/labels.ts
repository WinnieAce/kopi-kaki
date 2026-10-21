import type { CupId, DrinkGroup } from '../content/schema'

export const CUP_NAMES: Record<CupId, string> = {
  'kopitiam-cup': 'Kopitiam cup and saucer',
  'peng-glass': 'Peng glass',
  'cafe-cup': 'Café cup and saucer',
  'tall-glass': 'Tall glass',
  mug: 'Mug',
}

export const GROUP_NAMES: Record<DrinkGroup, string> = {
  kopi: 'Kopi',
  teh: 'Teh',
  'malt-and-chocolate': 'Malt and chocolate',
  cooling: 'Cooling drinks',
  coffee: 'Coffee',
  'tea-and-matcha': 'Tea and matcha',
}

/** Shorter names for the filter chips. */
export const GROUP_CHIPS: Record<DrinkGroup, string> = {
  ...GROUP_NAMES,
  'malt-and-chocolate': 'Malt',
  cooling: 'Cooling',
}

/** A greeting for the top of the Café room, by the hour on the person's own clock. */
export function greeting(hour: number): string {
  if (hour >= 5 && hour < 12) return 'Good morning.'
  if (hour >= 12 && hour < 18) return 'Good afternoon.'
  return 'Good evening.'
}
