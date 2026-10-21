import { screen, within } from '@testing-library/react'
import App from '../App'
import { defaultUserData } from '../storage/userData'
import { expectAccessible, renderApp } from '../test/render'
import { fixtureContent } from '../test/fixtures'

const open = async (route = '/words') => {
  const view = renderApp(<App />, { data: defaultUserData(), route })
  await screen.findByRole('heading', { level: 1, name: 'Kopitiam words' })
  return view
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})

it('gives every term its own section, named by the word', async () => {
  await open()
  for (const term of fixtureContent.terms) {
    const section = document.getElementById(term.id)!
    expect(within(section).getByRole('heading', { level: 2 })).toHaveTextContent(term.word)
  }
})

it('lists other spellings', async () => {
  await open()
  expect(document.getElementById('peng')).toHaveTextContent('Also: Beng')
})

it('links an example to the builder with its choices', async () => {
  await open()
  const link = within(document.getElementById('peng')!).getByRole('link', { name: 'Kopi Peng' })
  expect(link).toHaveAttribute('href', '/kopitiam/kopi?temp=peng')
})

it('opens at the word asked for', async () => {
  await open('/words#peng')
  expect(Element.prototype.scrollIntoView).toHaveBeenCalled()
  expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(document.getElementById('peng'))
})

it('has no Chinese, since ordering terms carry none', async () => {
  await open()
  expect(document.querySelector('[lang="zh-Hans"]')).toBeNull()
})

it('has no axe violations', async () => {
  await open()
  await expectAccessible()
})
