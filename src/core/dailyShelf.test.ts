import type { Content, Drink } from '../content/schema'
import { fixtureContent, fixtureDrink } from '../test/fixtures'
import { dailyStarters, dayNumber } from './dailyShelf'

// A café room with five easy coffees, two easy teas and one harder coffee.
const cafe = (id: string, group: Drink['group'], difficulty: Drink['difficulty'] = 'easy'): Drink => ({
  ...fixtureDrink('flat-white'),
  id,
  name: id,
  group,
  difficulty,
})
const content: Content = {
  ...fixtureContent,
  drinks: [
    cafe('c1', 'coffee'),
    cafe('c2', 'coffee'),
    cafe('c3', 'coffee'),
    cafe('c4', 'coffee'),
    cafe('c5', 'coffee'),
    cafe('hard', 'coffee', 'harder'),
    cafe('t1', 'tea-and-matcha'),
    cafe('t2', 'tea-and-matcha'),
  ],
}
const on = (iso: string, perGroup = 3) => dailyStarters(content, 'cafe', new Date(iso), perGroup).map((d) => d.id)

it('takes up to perGroup easy drinks from each group, taking turns between groups', () => {
  const picks = on('2026-10-21T12:00:00')
  expect(picks).toHaveLength(5)
  expect(picks.filter((id) => id.startsWith('c'))).toHaveLength(3)
  expect(picks.filter((id) => id.startsWith('t')).sort()).toEqual(['t1', 't2'])
  expect(picks.slice(0, 2).map((id) => id[0])).toEqual(['c', 't'])
  expect(picks).not.toContain('hard')
})

it('keeps the same drinks all day, whatever the time', () => {
  expect(on('2026-10-21T23:55:00')).toEqual(on('2026-10-21T00:05:00'))
})

it('changes the drinks from one day to the next', () => {
  expect(on('2026-10-22T12:00:00')).not.toEqual(on('2026-10-21T12:00:00'))
})

it('only picks from the room asked for', () => {
  expect(dailyStarters(fixtureContent, 'kopitiam', new Date('2026-10-21T12:00:00'), 1).map((d) => d.id)).toEqual([
    'kopi',
    'milo',
    'barley',
  ])
})

it('starts a new day at local midnight', () => {
  expect(dayNumber(new Date('2026-10-21T23:59:00'))).toBe(dayNumber(new Date('2026-10-21T00:00:00')))
  expect(dayNumber(new Date('2026-10-22T00:00:00'))).toBe(dayNumber(new Date('2026-10-21T00:00:00')) + 1)
})
