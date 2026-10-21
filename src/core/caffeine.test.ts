import { fixtureById, fixtureDrink } from '../test/fixtures'
import { caffeineOf, levelOf, roundCaffeine } from './caffeine'
import { resolveOrder, type Choices } from './order'

const caf = (drink: string, choices?: Choices) => caffeineOf(resolveOrder(fixtureDrink(drink), choices).lines, fixtureById)

it('kopi', () => {
  expect(caf('kopi')).toEqual({ mg: 100, level: 'high', label: 'about 100 mg', fromCocoaOnly: false })
})

it('kopi po', () => {
  expect(caf('kopi', { strength: 'po' })).toMatchObject({ mg: 75, level: 'medium', label: 'about 80 mg' })
})

it('kopi gau', () => {
  expect(caf('kopi', { strength: 'gau' }).label).toBe('about 140 mg')
})

it('milo is a trace from cocoa', () => {
  expect(caf('milo')).toEqual({ mg: 6, level: 'low', label: 'about 5 mg', fromCocoaOnly: true })
})

it('barley has none', () => {
  expect(caf('barley')).toEqual({ mg: 0, level: 'none', label: 'No caffeine', fromCocoaOnly: false })
})

it.each([
  [2, 5],
  [6, 5],
  [8.4, 10],
  [17.4, 15],
  [19.9, 20],
  [23, 20],
  [99.6, 100],
])('rounds %s to %s', (mg, out) => {
  expect(roundCaffeine(mg)).toBe(out)
})

it.each([
  [0, 'none'],
  [39.9, 'low'],
  [40, 'medium'],
  [99.6, 'medium'],
  [100, 'high'],
])('level of %s is %s', (mg, level) => {
  expect(levelOf(mg)).toBe(level)
})

it('counts optional lines', () => {
  expect(caffeineOf([{ ingredientId: 'espresso', amount: 30, optional: true }], fixtureById).mg).toBe(60)
})
