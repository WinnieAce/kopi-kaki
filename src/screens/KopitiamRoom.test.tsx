import { screen, waitFor, within } from '@testing-library/react'
import App from '../App'
import { defaultUserData, type UserData } from '../storage/userData'
import { expectAccessible, LocationProbe, renderApp } from '../test/render'

const open = (data: UserData = defaultUserData(), route = '/') =>
  renderApp(<><App /><LocationProbe /></>, { data, route })

const menuNames = () =>
  within(screen.getByRole('region', { name: 'Menu' }))
    .getAllByRole('link')
    .map((l) => l.querySelector('.menu-name')?.textContent)

it('shows the signboard, with its Chinese marked as Chinese', async () => {
  open()
  expect(await screen.findByRole('heading', { level: 1, name: 'Kopitiam' })).toBeInTheDocument()
  expect(screen.getByText('咖啡店')).toHaveAttribute('lang', 'zh-Hans')
})

it('groups the menu, skipping empty groups', async () => {
  open()
  const menu = await screen.findByRole('region', { name: 'Menu' })
  expect(within(menu).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
    'Kopi',
    'Malt and chocolate',
    'Cooling drinks',
  ])
  expect(within(menu).getByRole('link', { name: /^Kopi/ })).toHaveAttribute('href', '/kopitiam/kopi')
})

it('each row shows its Chinese name and caffeine level in words', async () => {
  open()
  const menu = await screen.findByRole('region', { name: 'Menu' })
  const kopi = within(menu).getByRole('link', { name: /^Kopi/ })
  expect(within(kopi).getByText('咖啡')).toHaveAttribute('lang', 'zh-Hans')
  expect(kopi).toHaveTextContent('High')
  expect(within(menu).getByRole('link', { name: /^Milo/ })).toHaveTextContent('Low')
  expect(within(menu).getByRole('link', { name: /^Barley/ })).toHaveTextContent('No caffeine')
})

it.each([
  ['Cooling', ['Barley']],
  ['No caffeine', ['Barley']],
  ['Kopi', ['Kopi']],
])('the %s chip filters the menu', async (chip, names) => {
  const { user } = open()
  await user.click(await screen.findByRole('button', { name: chip }))
  expect(menuNames()).toEqual(names)
  expect(screen.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'false')
})

it('search finds an order-style query and keeps it in the address', async () => {
  const { user } = open()
  await user.type(await screen.findByRole('searchbox', { name: /search drinks or words/i }), 'kopi o kosong')
  expect(menuNames()).toEqual(['Kopi'])
  expect(screen.getByTestId('location')).toHaveTextContent('q=kopi+o+kosong')
})

it('shows the usual order with a Make it link', async () => {
  open({ ...defaultUserData(), usual: { drinkId: 'kopi', choices: { milk: 'c', sugar: 'siew-dai', temp: 'peng' } } })
  const usual = await screen.findByRole('region', { name: 'Your usual' })
  expect(usual).toHaveTextContent('Kopi C Siew Dai Peng')
  expect(within(usual).getByRole('link', { name: 'Make it' })).toHaveAttribute(
    'href',
    '/kopitiam/kopi/make?milk=c&sugar=siew-dai&temp=peng',
  )
})

it('explains and offers Clear filters when nothing matches', async () => {
  const { user } = open(defaultUserData(), '/?q=bubble+tea')
  expect(await screen.findByText(/no drinks match/i)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Clear filters' }))
  expect(menuNames()).toEqual(['Kopi', 'Milo', 'Barley'])
})

it('links to Kopitiam words', async () => {
  open()
  expect(await screen.findByRole('link', { name: /kopitiam words/i })).toHaveAttribute('href', '/words')
})

it('has no axe violations', async () => {
  open({ ...defaultUserData(), usual: { drinkId: 'kopi', choices: { milk: 'c' } } })
  await screen.findByRole('heading', { level: 1 })
  await expectAccessible()
})

it('lets the usual cup’s steam rest after a few seconds', async () => {
  open({ ...defaultUserData(), usual: { drinkId: 'kopi', choices: {} } })
  const usual = await screen.findByRole('region', { name: 'Your usual' })
  await waitFor(() => expect(usual).toHaveClass('resting'), { timeout: 6500 })
}, 9000)
