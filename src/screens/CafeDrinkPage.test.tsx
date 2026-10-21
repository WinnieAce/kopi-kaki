import { screen, within } from '@testing-library/react'
import App from '../App'
import { ALLERGEN_LABEL_NOTE } from '../core/allergens'
import { HIGH_CAFFEINE_NOTE_CAFE } from '../core/caffeine'
import { defaultUserData } from '../storage/userData'
import { expectAccessible, renderApp } from '../test/render'

const open = async (route = '/cafe/flat-white') => {
  const view = renderApp(<App />, { data: defaultUserData(), route })
  await screen.findByRole('heading', { level: 1 })
  return view
}

it('shows the drink', async () => {
  await open()
  expect(screen.getByRole('heading', { level: 1, name: 'Flat White' })).toBeInTheDocument()
  expect(screen.getByText('about 120 mg')).toBeInTheDocument()
  expect(screen.getByText(HIGH_CAFFEINE_NOTE_CAFE)).toBeInTheDocument()
  expect(screen.queryByText(/Po order/)).not.toBeInTheDocument()
  expect(screen.getByText(/A double espresso with a little velvety milk/)).toBeInTheDocument()
  const ingredients = screen.getByRole('list', { name: 'Ingredients' })
  expect(within(ingredients).getByText('Espresso').closest('li')).toHaveTextContent('60 ml')
  expect(within(ingredients).getByText('Milk').closest('li')).toHaveTextContent('120 ml')
  expect(screen.getByText(/Espresso machine/).closest('li')).toHaveTextContent('or A moka pot')
  expect(screen.getByText('Contains: dairy')).toBeInTheDocument()
  expect(screen.getByText(ALLERGEN_LABEL_NOTE)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'Make this at home' })).toHaveAttribute('href', '/cafe/flat-white/make')
})

it('Save toggles the drink in Saved', async () => {
  const { user, store } = await open()
  await user.click(screen.getByRole('button', { name: 'Save' }))
  expect((await store.load())!.saved).toEqual([{ drinkId: 'flat-white', choices: {} }])
  await user.click(screen.getByRole('button', { name: 'Saved' }))
  expect((await store.load())!.saved).toEqual([])
})

it.each(['/cafe/nope', '/cafe/kopi'])('%s is not found', async (route) => {
  await open(route)
  expect(screen.getByRole('heading', { level: 1, name: /couldn't find that drink/i })).toBeInTheDocument()
})

it('has no axe violations', async () => {
  await open()
  await expectAccessible()
})
