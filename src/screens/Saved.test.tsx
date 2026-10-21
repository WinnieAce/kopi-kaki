import { act, fireEvent, screen, within } from '@testing-library/react'
import App from '../App'
import { defaultUserData, type UserData } from '../storage/userData'
import { expectAccessible, renderApp } from '../test/render'

const usual = { drinkId: 'kopi', choices: { milk: 'c', sugar: 'siew-dai', temp: 'peng' } }
const data: UserData = { ...defaultUserData(), saved: [usual, { drinkId: 'flat-white', choices: {} }], usual }

const open = async (d: UserData = data) => {
  const view = renderApp(<App />, { data: d, route: '/saved' })
  await screen.findByRole('heading', { level: 1, name: 'Saved' })
  return view
}
const names = () =>
  within(screen.getByRole('list', { name: 'Saved drinks' }))
    .queryAllByRole('link')
    .map((l) => l.querySelector('.menu-name')?.textContent)

afterEach(() => {
  vi.useRealTimers()
})

it('lists saved drinks by their order names, the usual marked', async () => {
  await open()
  expect(names()).toEqual(['Kopi C Siew Dai Peng', 'Flat White'])
  const kopi = screen.getByRole('link', { name: /Kopi C Siew Dai Peng/ })
  expect(kopi).toHaveAttribute('href', '/kopitiam/kopi?milk=c&sugar=siew-dai&temp=peng')
  expect(kopi.closest('li')).toHaveTextContent('Your usual')
  expect(screen.getByRole('link', { name: /Flat White/ })).toHaveAttribute('href', '/cafe/flat-white')
})

it('removing is immediate, with Undo putting it back in place', async () => {
  const { user, store } = await open()
  await user.click(screen.getByRole('button', { name: 'Remove Kopi C Siew Dai Peng' }))
  expect(names()).toEqual(['Flat White'])
  expect((await store.load())!.saved).toEqual([{ drinkId: 'flat-white', choices: {} }])
  await user.click(screen.getByRole('button', { name: 'Undo' }))
  expect(names()).toEqual(['Kopi C Siew Dai Peng', 'Flat White'])
})

it('Undo disappears after 5 seconds', async () => {
  await open()
  vi.useFakeTimers()
  fireEvent.click(screen.getByRole('button', { name: 'Remove Flat White' }))
  expect(screen.getByRole('button', { name: 'Undo' })).toBeInTheDocument()
  act(() => {
    vi.advanceTimersByTime(5000)
  })
  expect(screen.queryByRole('button', { name: 'Undo' })).not.toBeInTheDocument()
})

it('explains how to save when empty', async () => {
  await open(defaultUserData())
  expect(screen.getByText(/nothing saved yet/i)).toBeInTheDocument()
})

it('has no axe violations', async () => {
  await open()
  await expectAccessible()
})
