import { screen } from '@testing-library/react'
import App from '../App'
import { defaultUserData } from '../storage/userData'
import { renderApp } from '../test/render'

const feedback = vi.hoisted(() => ({ url: '' }))
vi.mock('../config', () => ({
  APP_NAME: 'Kopi Kaki',
  get FEEDBACK_URL() {
    return feedback.url
  },
}))

const open = async () => {
  renderApp(<App />, { data: defaultUserData(), route: '/terms' })
  await screen.findByRole('heading', { level: 1, name: 'Terms and privacy' })
}

afterEach(() => {
  feedback.url = ''
})

it.each([/no accounts/i, /no cookies/i, /stays on this device/i, /estimates/i, /check the label/i, /ask an adult/i])(
  'says %s',
  async (text) => {
    await open()
    expect(screen.getAllByText(text).length).toBeGreaterThan(0)
  },
)

it('says the feedback form asks for no names or email addresses, when there is one', async () => {
  feedback.url = 'https://example.com/form'
  await open()
  expect(screen.getByText(/names or email addresses/i)).toBeInTheDocument()
})

it('does not mention a feedback form when there is none', async () => {
  await open()
  expect(screen.queryByText(/feedback form/i)).not.toBeInTheDocument()
})
