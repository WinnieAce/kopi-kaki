import type { Ingredient } from '../content/schema'
import { fixtureById, fixtureDrink } from '../test/fixtures'
import { orderAllergens } from './allergens'
import { resolveOrder, type Choices } from './order'

const al = (drink: string, choices?: Choices) => orderAllergens(resolveOrder(fixtureDrink(drink), choices).lines, fixtureById)

it('kopi has dairy; kopi O has none', () => {
  expect(al('kopi')).toEqual(['dairy'])
  expect(al('kopi', { milk: 'o' })).toEqual([])
})

it('milo and barley', () => {
  expect(al('milo')).toEqual(['dairy', 'gluten'])
  expect(al('barley')).toEqual(['gluten'])
})

it('lists each allergen once, in a fixed order, including optional lines', () => {
  const make = (id: string, allergens: Ingredient['allergens']): Ingredient => ({ ...fixtureById.get('milk')!, id, allergens })
  const byId = new Map([
    ['peanut-syrup', make('peanut-syrup', ['nuts'])],
    ['soy-milk', make('soy-milk', ['soy'])],
    ['cream', make('cream', ['dairy'])],
  ])
  const lines = ['peanut-syrup', 'soy-milk', 'cream', 'cream'].map((ingredientId, n) => ({
    ingredientId,
    amount: 10,
    optional: n === 0,
  }))
  expect(orderAllergens(lines, byId)).toEqual(['dairy', 'soy', 'nuts'])
})
