import { screen, within } from '@testing-library/react'
import App from '../App'
import { ALLERGEN_LABEL_NOTE } from '../core/allergens'
import { HIGH_CAFFEINE_NOTE, HIGH_CAFFEINE_NOTE_PLAIN } from '../core/caffeine'
import { defaultUserData } from '../storage/userData'
import { fixtureContent } from '../test/fixtures'
import { expectAccessible, LocationProbe, renderApp } from '../test/render'

const reason = 'Condensed milk is already sweet, so it can’t be Kosong. For no sugar, choose O or C.'

const open = async (route: string) => {
  const view = renderApp(<><App /><LocationProbe /></>, { data: defaultUserData(), route })
  await screen.findByRole('heading', { level: 1 })
  return view
}
const pick = (group: string, option: string) => within(screen.getByRole('group', { name: group })).getByRole('radio', { name: option })
const ingredients = () => screen.getByRole('list', { name: 'Ingredients' })

it('shows the default order', async () => {
  await open('/kopitiam/kopi')
  expect(screen.getByRole('heading', { level: 1, name: 'Kopi' })).toBeInTheDocument()
  expect(screen.getByText('咖啡')).toHaveAttribute('lang', 'zh-Hans')
  expect(screen.getByText('Coffee · condensed milk · hot')).toBeInTheDocument()
  expect(screen.getByText('about 100 mg')).toBeInTheDocument()
  expect(screen.getByText(HIGH_CAFFEINE_NOTE)).toBeInTheDocument()
  expect(screen.getByText('Contains: dairy')).toBeInTheDocument()
  expect(screen.getByText(ALLERGEN_LABEL_NOTE)).toBeInTheDocument()
  expect(screen.getAllByRole('group').map((g) => g.querySelector('legend')?.textContent)).toEqual([
    'Milk',
    'Strength',
    'Sugar',
    'Temp',
  ])
})

it('choices rename the order, change the recipe and update the address', async () => {
  const { user } = await open('/kopitiam/kopi')
  await user.click(pick('Milk', 'C'))
  await user.click(pick('Strength', 'Gau'))
  await user.click(pick('Sugar', 'Siew Dai'))
  await user.click(pick('Temp', 'Peng'))
  expect(screen.getByRole('heading', { level: 1, name: 'Kopi C Gau Siew Dai Peng' })).toBeInTheDocument()
  expect(screen.getByText('about 140 mg')).toBeInTheDocument()
  expect(ingredients()).toHaveTextContent('14 g')
  expect(ingredients()).toHaveTextContent('1 tsp')
  expect(within(ingredients()).getByText('Ice').closest('li')).toHaveTextContent('6')
  expect(screen.getByTestId('location')).toHaveTextContent('/kopitiam/kopi?milk=c&strength=gau&sugar=siew-dai&temp=peng')
  expect(document.querySelector('.vessel-cup[data-shown="true"] svg')).toHaveAttribute('data-kind', 'peng-glass')
})

it('a blocked option explains itself', async () => {
  const { user } = await open('/kopitiam/kopi')
  await user.click(pick('Sugar', 'Kosong'))
  expect(within(screen.getByRole('group', { name: 'Sugar' })).getByRole('status')).toHaveTextContent(reason)
  expect(pick('Sugar', 'Normal')).toBeChecked()
})

it('switching to Condensed while Kosong is chosen moves sugar back and says why', async () => {
  const { user } = await open('/kopitiam/kopi?milk=o&sugar=kosong')
  expect(screen.getByRole('heading', { level: 1, name: 'Kopi O Kosong' })).toBeInTheDocument()
  await user.click(pick('Milk', 'Condensed'))
  expect(pick('Sugar', 'Normal')).toBeChecked()
  expect(within(screen.getByRole('group', { name: 'Sugar' })).getByRole('status')).toHaveTextContent(reason)
  expect(screen.getByTestId('location')).toHaveTextContent(/^\/kopitiam\/kopi$/)
})

it('a hand-edited address resolves sensibly', async () => {
  await open('/kopitiam/kopi?milk=c&milk=o&sugar=Kosong&fizz=1')
  expect(screen.getByRole('heading', { level: 1, name: 'Kopi C' })).toBeInTheDocument()
})

it('explains each chosen word with a link to Kopitiam words', async () => {
  const { user } = await open('/kopitiam/kopi')
  await user.click(pick('Milk', 'O'))
  const words = screen.getByRole('region', { name: 'What the words mean' })
  expect(within(words).getByRole('link', { name: 'O' })).toHaveAttribute('href', '/words#o')
  expect(words).toHaveTextContent('no milk')
})

it('offers only the rows a drink takes', async () => {
  await open('/kopitiam/barley')
  expect(screen.getByRole('heading', { level: 1, name: 'Barley Peng' })).toBeInTheDocument()
  expect(screen.getAllByRole('group').map((g) => g.querySelector('legend')?.textContent)).toEqual(['Strength', 'Sugar', 'Temp'])
  expect(within(screen.getByRole('group', { name: 'Strength' })).getAllByRole('radio').map((r) => r.closest('label')?.textContent)).toEqual([
    'Normal',
    'Di Lo',
  ])
})

it('Make this at home keeps the order', async () => {
  const { user } = await open('/kopitiam/kopi')
  await user.click(pick('Milk', 'O'))
  expect(screen.getByRole('link', { name: 'Make this at home' })).toHaveAttribute('href', '/kopitiam/kopi/make?milk=o')
})

it('saves the order and makes it the usual', async () => {
  const { user, store } = await open('/kopitiam/kopi?milk=c')
  await user.click(screen.getByRole('button', { name: 'Save' }))
  expect((await store.load())!.saved).toEqual([{ drinkId: 'kopi', choices: { milk: 'c' } }])
  await user.click(screen.getByRole('button', { name: 'Make this my usual' }))
  expect(screen.getByRole('button', { name: 'Your usual' })).toBeInTheDocument()
  expect((await store.load())!.usual).toEqual({ drinkId: 'kopi', choices: { milk: 'c' } })
})

it.each(['/kopitiam/nope', '/kopitiam/flat-white'])('%s is not found', async (route) => {
  await open(route)
  expect(screen.getByRole('heading', { level: 1, name: /couldn't find that drink/i })).toBeInTheDocument()
})

it('has no axe violations', async () => {
  await open('/kopitiam/kopi?milk=c')
  await expectAccessible()
})

describe('the high-caffeine note', () => {
  // Stronger ingredients, so a Po kopi and a plain Milo are both High.
  const strong = structuredClone(fixtureContent)
  strong.ingredients.find((i) => i.id === 'kopi-powder')!.caffeineMg = 20
  strong.ingredients.find((i) => i.id === 'milo-powder')!.caffeineMg = 50
  const show = async (route: string) => {
    renderApp(<App />, { data: defaultUserData(), route, content: strong })
    await screen.findByRole('heading', { level: 1 })
  }

  it('suggests Po when the drink offers it', async () => {
    await show('/kopitiam/kopi')
    expect(screen.getByText(HIGH_CAFFEINE_NOTE)).toBeInTheDocument()
  })

  it('does not suggest Po on an order that is already Po', async () => {
    await show('/kopitiam/kopi?strength=po')
    expect(screen.getByText(HIGH_CAFFEINE_NOTE_PLAIN)).toBeInTheDocument()
  })

  it('does not suggest Po for a drink that has no Po', async () => {
    await show('/kopitiam/milo')
    expect(screen.getByText(HIGH_CAFFEINE_NOTE_PLAIN)).toBeInTheDocument()
  })
})
