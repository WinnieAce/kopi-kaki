import { screen } from '@testing-library/react'
import App from './App'
import { defaultUserData } from './storage/userData'
import { renderApp } from './test/render'

it('opens on the Kopitiam room', async () => {
  renderApp(<App />, { data: defaultUserData() })
  expect(await screen.findByRole('heading', { level: 1, name: 'Kopitiam' })).toBeInTheDocument()
})

it('names the page after its screen', async () => {
  renderApp(<App />, { data: defaultUserData(), route: '/saved' })
  await screen.findByRole('heading', { level: 1, name: 'Saved' })
  expect(document.title).toBe('Saved · Kopi Kaki')
})

it('renames the page when an order is renamed by its choices', async () => {
  const { user } = renderApp(<App />, { data: defaultUserData(), route: '/kopitiam/kopi' })
  await screen.findByRole('heading', { level: 1, name: 'Kopi' })
  await user.click(screen.getByRole('radio', { name: 'Peng' }))
  expect(document.title).toBe('Kopi Peng · Kopi Kaki')
})
