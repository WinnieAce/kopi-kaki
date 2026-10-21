import { CAFE_GROUPS, CUPS, KOPITIAM_GROUPS } from '../content/schema'
import { CUP_NAMES, GROUP_CHIPS, GROUP_NAMES, greeting } from './labels'

it.each([
  [0, 'Good evening'],
  [5, 'Good morning'],
  [11, 'Good morning'],
  [12, 'Good afternoon'],
  [17, 'Good afternoon'],
  [18, 'Good evening'],
  [23, 'Good evening'],
])('at hour %i says "%s"', (hour, expected) => {
  expect(greeting(hour)).toBe(expected)
})

it('names every cup', () => {
  expect(CUPS.map((c) => CUP_NAMES[c])).toEqual([
    'Kopitiam cup and saucer',
    'Peng glass',
    'Café cup and saucer',
    'Tall glass',
    'Mug',
  ])
})

it('names every group, with a short chip label', () => {
  expect([...KOPITIAM_GROUPS, ...CAFE_GROUPS].map((g) => GROUP_NAMES[g])).toEqual([
    'Kopi',
    'Teh',
    'Malt and chocolate',
    'Cooling drinks',
    'Coffee',
    'Tea and matcha',
  ])
  expect([...KOPITIAM_GROUPS, ...CAFE_GROUPS].map((g) => GROUP_CHIPS[g])).toEqual([
    'Kopi',
    'Teh',
    'Malt',
    'Cooling',
    'Coffee',
    'Tea and matcha',
  ])
})
