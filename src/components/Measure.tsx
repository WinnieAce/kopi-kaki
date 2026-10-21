import type { Unit } from '../content/schema'
import { formatMeasure, scaleAmount } from '../core/measures'

/** An amount scaled to the number of servings, rounded for reading. */
export function Measure({ amount, unit, servings = 1 }: { amount: number; unit: Unit; servings?: number }) {
  return <span className="measure">{formatMeasure(scaleAmount(amount, servings), unit)}</span>
}
