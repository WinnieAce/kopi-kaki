import type { Unit } from '../content/schema'
import { clampServings, formatMeasure, scaleAmount } from './measures'

it.each<[number, Unit, string]>([
  [60, 'ml', '60 ml'],
  [22.5, 'ml', '22.5 ml'],
  [33, 'ml', '35 ml'],
  [1, 'ml', '2.5 ml'],
  [3200, 'ml', '3200 ml'],
  [10, 'g', '10 g'],
  [14, 'g', '14 g'],
  [12.6, 'g', '13 g'],
  [7.3, 'g', '7.5 g'],
  [0.2, 'g', '0.5 g'],
  [1, 'tsp', '1 tsp'],
  [0.5, 'tsp', '½ tsp'],
  [1.5, 'tsp', '1½ tsp'],
  [0.125, 'tsp', '¼ tsp'],
  [6, 'tsp', '6 tsp'],
  [2, 'tbsp', '2 tbsp'],
  [0.75, 'tbsp', '¾ tbsp'],
  [6, 'piece', '6'],
  [0.5, 'piece', '½'],
])('formats %s %s as %s', (amount, unit, out) => {
  expect(formatMeasure(amount, unit)).toBe(out)
})

it('scales', () => {
  expect(formatMeasure(scaleAmount(400, 8), 'ml')).toBe('3200 ml')
})

it.each([
  [0, 1],
  [9, 8],
  [2.6, 3],
  [NaN, 1],
  [-3, 1],
])('clamps servings %s to %s', (n, out) => {
  expect(clampServings(n)).toBe(out)
})
