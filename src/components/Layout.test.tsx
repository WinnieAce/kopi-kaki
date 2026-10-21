import { screen, within } from '@testing-library/react'
import App from '../App'
import { defaultUserData } from '../storage/userData'
import { createMemoryStore, expectAccessible, LocationProbe, renderApp } from '../test/render'

const open = (route: string) => renderApp(<><App /><LocationProbe /></>, { data: defaultUserData(), route })

it('shows four tabs, with the room of the page active', async () => {
  open('/cafe/flat-white')
  const nav = await screen.findByRole('navigation', { name: 'Main' })
  expect(within(nav).getAllByRole('link').map((l) => l.textContent)).toEqual(['Kopitiam', 'Café', 'Saved', 'Settings'])
  expect(within(nav).getByRole('link', { name: 'Café' })).toHaveAttribute('aria-current', 'page')
  expect(document.documentElement.dataset.room).toBe('cafe')
})

it('keeps the Kopitiam tab active on kopitiam pages', async () => {
  open('/words')
  const nav = await screen.findByRole('navigation', { name: 'Main' })
  expect(within(nav).getByRole('link', { name: 'Kopitiam' })).toHaveAttribute('aria-current', 'page')
  expect(document.documentElement.dataset.room).toBe('kopitiam')
})

it('has one highlight, so it can slide between tabs', async () => {
  open('/saved')
  const nav = await screen.findByRole('navigation', { name: 'Main' })
  const pills = nav.querySelectorAll('.nav-pill')
  expect(pills).toHaveLength(1)
  expect(pills[0].closest('a')).toHaveTextContent('Saved')
})

it('main tabs have no Back button', async () => {
  open('/')
  await screen.findByRole('navigation', { name: 'Main' })
  expect(screen.queryByRole('button', { name: 'Back' })).not.toBeInTheDocument()
})

it.each([
  ['/kopitiam/kopi', '/'],
  ['/cafe/flat-white', '/cafe'],
  ['/words', '/'],
])('Back on a page opened directly at %s goes to %s', async (route, room) => {
  const { user } = open(route)
  await user.click(await screen.findByRole('button', { name: 'Back' }))
  expect(screen.getByTestId('location')).toHaveTextContent(new RegExp(`^${room.replace('/', '\\/')}$`))
})

it('shows the not-saved notice when the store is not persistent', async () => {
  renderApp(<App />, { store: createMemoryStore(defaultUserData()) })
  expect(await screen.findByText(/won't be saved in this browser session/)).toBeInTheDocument()
})

it('unknown addresses show Not found with links to both rooms', async () => {
  open('/nowhere')
  expect(await screen.findByRole('heading', { level: 1, name: /couldn't find/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /kopitiam room/i })).toHaveAttribute('href', '/')
  expect(screen.getByRole('link', { name: /café room/i })).toHaveAttribute('href', '/cafe')
})

it.each(['/', '/cafe', '/saved', '/settings', '/terms', '/nowhere'])('%s has no axe violations', async (route) => {
  open(route)
  await screen.findByRole('heading', { level: 1 })
  await expectAccessible()
})
