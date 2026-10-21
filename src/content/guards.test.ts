import { fixtureContent, fixtureDrink } from '../test/fixtures'
import drinks from './drinks.json'
import { allCombinations, alcoholWords, combinationProblems, diLoMismatches, missingCautions } from './guards'
import ingredients from './ingredients.json'
import type { Content } from './schema'
import terms from './terms.json'

// Loosely typed so a test can break the content in ways the types would not allow.
type Raw = any

const shipped = { ingredients, drinks, terms } as Content

it('the fixture and the shipped content are clean', () => {
  for (const content of [fixtureContent, shipped]) {
    expect([
      ...alcoholWords(content),
      ...missingCautions(content),
      ...diLoMismatches(content),
      ...combinationProblems(content),
    ]).toEqual([])
  }
})

it('kopi has 96 combinations', () => {
  expect(allCombinations(fixtureDrink('kopi'))).toHaveLength(96)
})

it.each<[string, (c: Raw) => void, (c: Content) => string[]]>([
  ['an alcohol word', (c) => { c.drinks[0].about += ' Add a dash of rum.' }, alcoholWords],
  ['vanilla extract', (c) => { c.ingredients[0].description = 'Like vanilla extract.' }, alcoholWords],
  ['a hot step without its caution', (c) => { delete c.drinks[0].steps[0].caution }, missingCautions],
  ['a knife step without its caution', (c) => { c.drinks[0].steps[1].text = 'Cut a lime.' }, missingCautions],
  [
    'Di Lo without added water',
    (c) => { c.drinks[0].ingredients = c.drinks[0].ingredients.filter((i: Raw) => i.role !== 'dilute') },
    diLoMismatches,
  ],
  ['a line used in no step', (c) => { c.drinks[0].steps[3].ingredientIds = [] }, combinationProblems],
])('catches %s', (_name, mutate, guard) => {
  const content = structuredClone(fixtureContent)
  mutate(content)
  expect(guard(content)).not.toEqual([])
})

it('does not mistake ginger for gin', () => {
  const content = structuredClone(fixtureContent)
  content.drinks[0].about += ' With ginger.'
  expect(alcoholWords(content)).toEqual([])
})
