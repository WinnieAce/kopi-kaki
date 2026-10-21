import { fixtureDrink } from '../test/fixtures'
import { cupExtras } from './cupExtras'
import { resolveOrder } from './order'

const extras = (drink: string, choices = {}) => cupExtras(resolveOrder(fixtureDrink(drink), choices))

it('a hot kopi steams', () => {
  expect(extras('kopi')).toEqual({ ice: false, steam: true, straw: false, latteArt: false, foam: false })
})

it('a kopi peng has ice and no steam', () => {
  expect(extras('kopi', { temp: 'peng' })).toMatchObject({ ice: true, steam: false })
})

it('a flat white has latte art and steams', () => {
  expect(extras('flat-white')).toMatchObject({ latteArt: true, steam: true, ice: false })
})

it('a babyccino has latte art too', () => {
  expect(extras('babyccino').latteArt).toBe(true)
})
