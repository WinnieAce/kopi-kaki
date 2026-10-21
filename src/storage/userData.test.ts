import { fixtureContent } from '../test/fixtures'
import { defaultUserData, parseUserData, tidyUserData, type UserData } from './userData'

const valid: UserData = { ...defaultUserData(), saved: [{ drinkId: 'kopi', choices: { milk: 'c' } }] }

it('defaults', () => {
  expect(defaultUserData()).toEqual({ version: 1, saved: [], usual: null, settings: { theme: 'system', scheme: 'kopi' } })
})

it('accepts valid data', () => {
  expect(parseUserData(valid)).toEqual({ ok: true, data: valid })
})

it.each([null, 'x', {}, { version: 1 }, { version: 1, saved: 'a', usual: null, settings: {} }])('rejects %j', (raw) => {
  expect(parseUserData(raw)).toEqual({ ok: false, reason: 'invalid' })
})

it('rejects an unknown theme or scheme', () => {
  expect(parseUserData({ ...valid, settings: { theme: 'neon', scheme: 'kopi' } }).ok).toBe(false)
  expect(parseUserData({ ...valid, settings: { theme: 'dark', scheme: 'classic' } }).ok).toBe(false)
})

it('rejects a newer version', () => {
  expect(parseUserData({ ...valid, version: 2 })).toEqual({ ok: false, reason: 'newer-version' })
})

it('tidies data saved before a content change', () => {
  const d = tidyUserData(
    {
      ...valid,
      saved: [
        { drinkId: 'kopi', choices: { milk: 'c' } },
        { drinkId: 'kopi', choices: { milk: 'c', sugar: 'normal' } },
        { drinkId: 'gone', choices: {} },
        { drinkId: 'kopi', choices: { milk: 'condensed', sugar: 'kosong', fizz: '1' } },
      ],
      usual: { drinkId: 'gone', choices: {} },
    },
    fixtureContent,
  )
  expect(d.saved).toEqual([
    { drinkId: 'kopi', choices: { milk: 'c' } },
    { drinkId: 'kopi', choices: {} },
  ])
  expect(d.usual).toBeNull()
})

it('keeps a usual whose drink still exists, normalised', () => {
  const d = tidyUserData({ ...valid, usual: { drinkId: 'kopi', choices: { milk: 'c', temp: 'hot' } } }, fixtureContent)
  expect(d.usual).toEqual({ drinkId: 'kopi', choices: { milk: 'c' } })
})
