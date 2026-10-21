import { fixtureDrink } from '../test/fixtures'
import { choicesFromSearch, choicesToSearch, isBlocked, normaliseChoices, resolveOrder, type ResolvedLine } from './order'

const kopi = fixtureDrink('kopi')
const barley = fixtureDrink('barley')
const flatWhite = fixtureDrink('flat-white')
const ids = (lines: ResolvedLine[]) => lines.map((l) => [l.ingredientId, l.amount])

it('resolves the defaults', () => {
  const o = resolveOrder(kopi)
  expect(o.choices).toEqual({ milk: 'condensed', strength: 'normal', sugar: 'normal', temp: 'hot' })
  expect(o.name).toBe('Kopi')
  expect(o.meaning).toBe('Coffee · condensed milk · hot')
  expect(ids(o.lines)).toEqual([['kopi-powder', 10], ['boiling-water', 100], ['condensed-milk', 2], ['water', 60]])
  expect(o.steps.map((s) => s.text.slice(0, 12))).toEqual(['Put the kopi', 'Spoon the co', 'Pour the kop', 'Top up with '])
  expect([o.cup, o.colour, o.notes]).toEqual(['kopitiam-cup', '#c69a6c', []])
})

it('builds Kopi C Gau Siew Dai Peng', () => {
  const o = resolveOrder(kopi, { milk: 'c', strength: 'gau', sugar: 'siew-dai', temp: 'peng' })
  expect(o.name).toBe('Kopi C Gau Siew Dai Peng')
  expect(o.meaning).toBe('Coffee · evaporated milk · stronger · less sweet · iced')
  expect(ids(o.lines)).toEqual([
    ['kopi-powder', 14],
    ['boiling-water', 100],
    ['evaporated-milk', 1],
    ['sugar', 1],
    ['water', 60],
    ['ice', 6],
  ])
  expect([o.cup, o.colour]).toEqual(['peng-glass', '#b9875f'])
})

it('removes a line scaled to zero', () => {
  expect(resolveOrder(kopi, { milk: 'o', sugar: 'kosong' }).lines.map((l) => l.ingredientId)).not.toContain('sugar')
})

it('Po weakens and dilutes', () => {
  const lines = ids(resolveOrder(kopi, { strength: 'po' }).lines)
  expect(lines).toContainEqual(['kopi-powder', 7.5])
  expect(lines).toContainEqual(['water', 78])
})

it('Di Lo drops the added water and the step that only used it', () => {
  const o = resolveOrder(kopi, { strength: 'di-lo' })
  expect(o.lines.map((l) => l.ingredientId)).not.toContain('water')
  expect(o.steps).toHaveLength(3)
})

it('a blocked pair falls back and explains', () => {
  const o = resolveOrder(kopi, { milk: 'condensed', sugar: 'kosong' })
  expect([o.choices.sugar, o.name]).toEqual(['normal', 'Kopi'])
  expect(o.notes).toEqual(['Condensed milk is already sweet, so it can’t be Kosong. For no sugar, choose O or C.'])
})

it('ignores unknown groups and values, and is case-sensitive', () => {
  expect(resolveOrder(kopi, { milk: 'oat', fizz: 'yes', temp: 'PENG' }).name).toBe('Kopi')
})

it('ignores groups the drink lacks', () => {
  expect(resolveOrder(barley, { milk: 'o' }).name).toBe('Barley Peng')
})

it('a default with a word still names it', () => {
  expect([resolveOrder(barley).name, resolveOrder(barley).cup]).toEqual(['Barley Peng', 'peng-glass'])
  const hot = resolveOrder(barley, { temp: 'hot' })
  expect([hot.name, hot.cup]).toEqual(['Barley', 'kopitiam-cup'])
})

it('café drinks resolve to their fixed recipe', () => {
  const o = resolveOrder(flatWhite, { temp: 'peng' })
  expect([o.name, o.choices, o.cup]).toEqual(['Flat White', {}, 'cafe-cup'])
})

it('isBlocked reports the reason only while the blocking option is chosen', () => {
  expect(isBlocked(kopi, { milk: 'condensed' }, 'sugar', 'kosong')).toMatch(/already sweet/)
  expect(isBlocked(kopi, { milk: 'o' }, 'sugar', 'kosong')).toBeNull()
})

it('round-trips choices through the address', () => {
  const o = resolveOrder(kopi, { milk: 'c', sugar: 'normal', temp: 'peng' })
  expect(normaliseChoices(o)).toEqual({ milk: 'c', temp: 'peng' })
  expect(choicesToSearch(o)).toBe('milk=c&temp=peng')
  const messy = new URLSearchParams('milk=c&milk=o&sugar=Kosong&fizz=1')
  expect(choicesFromSearch(messy)).toEqual({ milk: 'c', sugar: 'Kosong', fizz: '1' })
  expect(resolveOrder(kopi, choicesFromSearch(messy)).name).toBe('Kopi C')
})
