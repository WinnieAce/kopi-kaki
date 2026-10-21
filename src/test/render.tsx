import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axe from 'axe-core'
import type { ReactElement } from 'react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { ContentProvider, makeContentValue } from '../content/ContentContext'
import type { Content } from '../content/schema'
import { createMemoryStore, type UserDataStore } from '../storage/store'
import type { UserData } from '../storage/userData'
import { UserDataProvider } from '../storage/UserDataProvider'
import { fixtureContent } from './fixtures'

export { createMemoryStore }

type Options = {
  data?: UserData
  store?: UserDataStore
  route?: string
  /** Earlier screens to start with, so Back has somewhere to go; the last one is shown. */
  history?: string[]
  content?: Content
}

/** Renders inside the router and providers, with the fixture content. A first visit unless `data` or `store` is given. */
export function renderApp(ui: ReactElement, { data, store, route = '/', history, content = fixtureContent }: Options = {}) {
  const usedStore = store ?? createMemoryStore(data ?? null)
  const user = userEvent.setup()
  const view = render(
    <ContentProvider value={makeContentValue(content)}>
      <UserDataProvider store={usedStore}>
        <MemoryRouter initialEntries={history ?? [route]}>{ui}</MemoryRouter>
      </UserDataProvider>
    </ContentProvider>,
  )
  return { ...view, user, store: usedStore }
}

/** Shows where the router is, for tests that follow links and Back. */
export function LocationProbe() {
  const { pathname, search } = useLocation()
  return <output data-testid="location">{pathname + search}</output>
}

/** Fails on any automated accessibility violation. Colour contrast is checked by palettes.test.ts instead. */
export async function expectAccessible(container: HTMLElement = document.body): Promise<void> {
  const results = await axe.run(container, { rules: { 'color-contrast': { enabled: false } } })
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.html).join(' | ')}`)).toEqual([])
}
