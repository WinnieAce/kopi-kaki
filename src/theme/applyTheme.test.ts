import { applyTheme, roomForPath } from './applyTheme'

it.each([
  ['/', 'kopitiam'],
  ['/kopitiam/kopi', 'kopitiam'],
  ['/kopitiam/kopi/make', 'kopitiam'],
  ['/words', 'kopitiam'],
  ['/cafe', 'cafe'],
  ['/cafe/flat-white/make', 'cafe'],
  ['/saved', 'cafe'],
  ['/settings', 'cafe'],
])('%s belongs to the %s room', (path, room) => {
  expect(roomForPath(path)).toBe(room)
})

const root = document.documentElement
const css = (name: string) => root.style.getPropertyValue(name)

it('paints the café room in the chosen scheme', () => {
  applyTheme('light', 'matcha', 'cafe')
  expect(css('--bg')).toBe('#f3ede5')
  expect(root.dataset.room).toBe('cafe')
  expect(root.dataset.theme).toBe('light')
})

it('paints the kopitiam room in marble and jade, whatever the café scheme', () => {
  applyTheme('dark', 'matcha', 'kopitiam')
  expect(css('--bg')).toBe('#191612')
  expect(css('--header')).toBe('#2a1a11')
  expect(root.dataset.room).toBe('kopitiam')
})

it('remembers the choice for the next visit', () => {
  applyTheme('dark', 'peng', 'cafe')
  expect(JSON.parse(localStorage.getItem('kopi-kaki-appearance')!)).toEqual({ theme: 'dark', scheme: 'peng' })
})
