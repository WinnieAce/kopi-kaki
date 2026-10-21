import { screen, waitFor, within } from '@testing-library/react'
import App from '../App'
import { defaultUserData, type UserData } from '../storage/userData'
import { expectAccessible, renderApp } from '../test/render'

const open = async (data: UserData = defaultUserData()) => {
  const view = renderApp(<App />, { data, route: '/cafe' })
  await screen.findByRole('heading', { level: 1 })
  return view
}
const menuNames = () =>
  within(screen.getByRole('region', { name: 'Menu' }))
    .getAllByRole('link')
    .map((l) => l.querySelector('.menu-name')?.textContent)

afterEach(() => {
  vi.useRealTimers()
})

it('is headed Café, with a greeting by the hour just above', async () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date('2026-10-21T09:00:00'))
  await open()
  const heading = screen.getByRole('heading', { level: 1, name: 'Café' })
  const hello = screen.getByText('Good morning')
  expect(hello.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
})

it('names the page Café, whatever the hour', async () => {
  await open()
  await waitFor(() => expect(document.title).toBe('Café · Kopi Kaki'))
})

it('Today’s cups puts saved café drinks first', async () => {
  await open({ ...defaultUserData(), saved: [{ drinkId: 'flat-white', choices: {} }] })
  const shelf = screen.getByRole('list', { name: 'Today’s cups' })
  expect(within(shelf).getAllByRole('link').map((l) => l.querySelector('.tile-name')?.textContent)).toEqual([
    'Flat White',
    'Babyccino',
  ])
})

it.each([
  ['No caffeine', ['Babyccino']],
  ['Coffee', ['Flat White', 'Babyccino']],
])('the %s chip filters the menu', async (chip, names) => {
  const { user } = await open()
  await user.click(screen.getByRole('button', { name: chip }))
  expect(menuNames()).toEqual(names)
})

it('rows show caffeine level in words and link to the drink', async () => {
  await open()
  const row = within(screen.getByRole('region', { name: 'Menu' })).getByRole('link', { name: /^Flat White/ })
  expect(row).toHaveTextContent('High')
  expect(row).toHaveAttribute('href', '/cafe/flat-white')
})

it('has no axe violations', async () => {
  await open({ ...defaultUserData(), saved: [{ drinkId: 'flat-white', choices: {} }] })
  await expectAccessible()
})
