import { fixtureContent } from '../test/fixtures'
import drinks from './drinks.json'
import ingredients from './ingredients.json'
import terms from './terms.json'
import { validateContent } from './validate'

// Loosely typed so a test can break the content in ways the types would not allow.
type Raw = any

it('accepts the fixture content', () => {
  expect(validateContent(fixtureContent)).toMatchObject({ ok: true })
})

it('the shipped content is valid', () => {
  expect(validateContent({ ingredients, drinks, terms })).toMatchObject({ ok: true })
})

it('reports a malformed record', () => {
  expect(validateContent({ ingredients: [{ id: 'x' }], drinks: [], terms: [] }).ok).toBe(false)
})

it.each<[string, (c: Raw) => void]>([
  ['duplicate drink id', (c) => c.drinks.push(c.drinks[0])],
  ['dangling line ingredient', (c) => { c.drinks[0].ingredients[0].ingredientId = 'nope' }],
  ['dangling step ingredient', (c) => { c.drinks[0].steps[0].ingredientIds = ['nope'] }],
  ['dangling substitute', (c) => { c.ingredients[0].substitutes = ['nope'] }],
  ['dangling ingredient term', (c) => { c.ingredients[2].termId = 'nope' }],
  ['missing option term', (c) => { c.terms = c.terms.filter((t: Raw) => t.id !== 'peng') }],
  ['term example for unknown drink', (c) => { c.terms[0].example = { drinkId: 'nope', choices: {} } }],
  ['caffeine without a source', (c) => { delete c.ingredients[0].caffeineSource }],
  ['reserved drink id', (c) => { c.drinks[0].id = 'words' }],
  ['group outside its room', (c) => { c.drinks[0].group = 'coffee' }],
  ['option not in its group', (c) => { c.drinks[0].choices.milk.options.push('gau') }],
  ['default not among options', (c) => { c.drinks[0].choices.temp.default = 'warm' }],
  [
    'block whose groups run backwards',
    (c) => {
      c.drinks[0].blocked[0] = {
        chosen: { group: 'sugar', option: 'kosong' },
        blocks: { group: 'milk', option: 'condensed' },
        reason: 'x',
      }
    },
  ],
  ['block on a default option', (c) => { c.drinks[0].blocked[0].blocks.option = 'normal' }],
  ['when naming an option the drink lacks', (c) => { c.drinks[0].ingredients[2].when = { milk: ['milk'] } }],
  ['colour for a milk option the drink lacks', (c) => { c.drinks[0].colourByMilk = { milk: '#000000' } }],
  ['café drink with choices', (c) => { c.drinks[3].choices = { temp: { options: ['hot', 'peng'], default: 'hot' } } }],
])('reports %s', (_name, mutate) => {
  const raw = structuredClone(fixtureContent)
  mutate(raw)
  expect(validateContent(raw).ok).toBe(false)
})
