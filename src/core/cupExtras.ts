import type { ResolvedOrder } from './order'

/** What is drawn in and around a cup besides the drink itself. Worked out from the order. */
export type CupExtras = {
  ice: boolean
  steam: boolean
  straw: boolean
  latteArt: boolean
  foam: boolean
}

export function cupExtras(order: ResolvedOrder): CupExtras {
  const ice = order.lines.some((l) => l.ingredientId === 'ice')
  const frothed = order.steps.some((s) => s.technique === 'froth')
  return {
    ice,
    steam: !ice && order.steps.some((s) => s.caution === 'hot'),
    straw: ice && order.cup === 'tall-glass',
    latteArt: order.cup === 'cafe-cup' && frothed,
    foam: order.cup === 'mug' && frothed,
  }
}
