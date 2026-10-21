import { fixtureById, fixtureContent } from '../test/fixtures'
import { filterDrinks, normalise, type DrinkFilters } from './search'

const run = (f: Partial<DrinkFilters>) =>
  filterDrinks(fixtureContent, { room: 'kopitiam', query: '', noCaffeine: false, ...f }, fixtureById).map((d) => d.id)

it('lists a room in content order', () => {
  expect(run({})).toEqual(['kopi', 'milo', 'barley'])
  expect(run({ room: 'cafe' })).toEqual(['flat-white', 'babyccino'])
})

it.each<[string, string[]]>([
  ['kopi o kosong', ['kopi']],
  ['Milo Peng', ['milo']],
  ['咖啡', ['kopi']],
  ['  BARLEY ', ['barley']],
  ['gau', ['kopi', 'milo']],
  ['condensed', ['kopi', 'milo']],
  ['bubble tea', []],
])('query %j finds %j', (query, out) => {
  expect(run({ query })).toEqual(out)
})

it('filters by group and by no caffeine', () => {
  expect(run({ group: 'cooling' })).toEqual(['barley'])
  expect(run({ noCaffeine: true })).toEqual(['barley'])
  expect(run({ room: 'cafe', noCaffeine: true })).toEqual(['babyccino'])
})

it('normalise keeps Chinese characters but drops case, accents and punctuation', () => {
  expect(normalise('  Kopi-O, Kosong! ')).toBe('kopi o kosong')
  expect(normalise('Café 咖啡')).toBe('cafe 咖啡')
})
