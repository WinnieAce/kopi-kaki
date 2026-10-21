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
