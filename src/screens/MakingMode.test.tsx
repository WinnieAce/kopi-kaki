import { screen, within } from '@testing-library/react'
import App from '../App'
import { defaultUserData } from '../storage/userData'
import { expectAccessible, LocationProbe, renderApp } from '../test/render'
import { CAUTION_TEXT, TECHNIQUES } from './MakingMode'

const open = async (route: string) => {
  const view = renderApp(<><App /><LocationProbe /></>, { data: defaultUserData(), route })
  await screen.findByRole('heading', { level: 1 })
  return view
}
const ingredients = () => screen.getByRole('list', { name: 'Ingredients' })
const row = (name: string) => within(ingredients()).getByText(name).closest('li')!

it('gathers the exact order first', async () => {
  await open('/kopitiam/kopi/make?milk=c&temp=peng')
  expect(screen.getByRole('heading', { level: 1, name: 'Kopi C Peng' })).toBeInTheDocument()
  expect(screen.getByText('Peng glass')).toBeInTheDocument()
  expect(row('Kopi powder')).toHaveTextContent('10 g')
  expect(row('Evaporated milk')).toHaveTextContent('1 tbsp')
  expect(row('Sugar')).toHaveTextContent('2 tsp')
  expect(row('Water')).toHaveTextContent('60 ml')
  expect(row('Ice')).toHaveTextContent('6')
  expect(screen.getByText(/Kopi sock/).closest('li')).toHaveTextContent('A fine sieve lined with a paper towel')
})

it('steps through the resolved steps', async () => {
  const { user } = await open('/kopitiam/kopi/make')
  await user.click(screen.getByRole('button', { name: 'Start' }))
  expect(screen.getByText('Step 1 of 4')).toBeInTheDocument()
  for (let i = 0; i < 3; i++) await user.click(screen.getByRole('button', { name: 'Next' }))
  expect(screen.getByText('Step 4 of 4')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Done' })).toBeInTheDocument()
})

it('shows a step’s caution', async () => {
  const { user } = await open('/kopitiam/kopi/make')
  await user.click(screen.getByRole('button', { name: 'Start' }))
  expect(screen.getByText(CAUTION_TEXT.hot)).toBeInTheDocument()
})

it('explains a technique', async () => {
  const { user } = await open('/kopitiam/kopi/make')
  await user.click(screen.getByRole('button', { name: 'Start' }))
  expect(screen.getByText(TECHNIQUES.brew.what)).toBeInTheDocument()
  expect(screen.getByText(TECHNIQUES.brew.noTool)).toBeInTheDocument()
})

it('servings scale and stay within 1 to 8', async () => {
  const { user } = await open('/kopitiam/kopi/make')
  expect(screen.getByRole('button', { name: 'Fewer servings' })).toBeDisabled()
  await user.click(screen.getByRole('button', { name: 'More servings' }))
  expect(screen.getByText('2 servings')).toBeInTheDocument()
  expect(row('Kopi powder')).toHaveTextContent('20 g')
  for (let i = 0; i < 6; i++) await user.click(screen.getByRole('button', { name: 'More servings' }))
  expect(screen.getByText('8 servings')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'More servings' })).toBeDisabled()
})

it('Done returns to the drink with its choices', async () => {
  const { user } = await open('/kopitiam/kopi/make?milk=c&temp=peng')
  await user.click(screen.getByRole('button', { name: 'Start' }))
  while (!screen.queryByRole('button', { name: 'Done' })) await user.click(screen.getByRole('button', { name: 'Next' }))
  await user.click(screen.getByRole('button', { name: 'Done' }))
  expect(screen.getByTestId('location')).toHaveTextContent('/kopitiam/kopi?milk=c&temp=peng')
})

it('works for café drinks', async () => {
  await open('/cafe/flat-white/make')
  expect(screen.getByRole('heading', { level: 1, name: 'Flat White' })).toBeInTheDocument()
  expect(screen.getByText('Café cup and saucer')).toBeInTheDocument()
})

it.each(['/kopitiam/nope/make', '/cafe/kopi/make'])('%s is not found', async (route) => {
  await open(route)
  expect(screen.getByRole('heading', { level: 1, name: /couldn't find that drink/i })).toBeInTheDocument()
})

it('has no axe violations', async () => {
  const { user } = await open('/kopitiam/kopi/make')
  await expectAccessible()
  await user.click(screen.getByRole('button', { name: 'Start' }))
  await expectAccessible()
})
