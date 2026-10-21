import { screen } from '@testing-library/react'
import { createMemoryStore, renderApp } from '../test/render'
import { defaultUserData, type UserData } from './userData'
import { useUserData } from './UserDataContext'

const kopiC = { drinkId: 'kopi', choices: { milk: 'c' } }
const milo = { drinkId: 'milo', choices: {} }

function Probe() {
  const { data, persistent, toggleSaved, removeSaved, restoreSaved, setUsual, setTheme, setScheme } = useUserData()
  return (
    <div>
      <output data-testid="saved">{data.saved.map((s) => `${s.drinkId}${JSON.stringify(s.choices)}`).join(' ')}</output>
      <output data-testid="usual">{data.usual ? data.usual.drinkId : 'none'}</output>
      <output data-testid="settings">{`${data.settings.theme} ${data.settings.scheme}`}</output>
      <output data-testid="persistent">{String(persistent)}</output>
      <button onClick={() => toggleSaved(kopiC)}>save kopi c</button>
      <button onClick={() => toggleSaved(milo)}>save milo</button>
      <button onClick={() => restoreSaved(kopiC, removeSaved(kopiC))}>remove and restore</button>
      <button onClick={() => removeSaved(kopiC)}>remove kopi c</button>
      <button onClick={() => setUsual(kopiC)}>usual</button>
      <button onClick={() => setTheme('dark')}>dark</button>
      <button onClick={() => setScheme('matcha')}>matcha</button>
    </div>
  )
}

it('a first visit starts empty', async () => {
  renderApp(<Probe />)
  expect(await screen.findByTestId('saved')).toHaveTextContent(/^$/)
  expect(screen.getByTestId('usual')).toHaveTextContent('none')
})

it('toggleSaved adds then removes, and persists', async () => {
  const { user, store } = renderApp(<Probe />, { data: defaultUserData() })
  await user.click(await screen.findByRole('button', { name: 'save kopi c' }))
  expect((await store.load())!.saved).toEqual([kopiC])
  await user.click(screen.getByRole('button', { name: 'save kopi c' }))
  expect((await store.load())!.saved).toEqual([])
})

it('a removed drink can be restored to the same place', async () => {
  const data: UserData = { ...defaultUserData(), saved: [kopiC, milo] }
  const { user, store } = renderApp(<Probe />, { data })
  await user.click(await screen.findByRole('button', { name: 'remove and restore' }))
  expect((await store.load())!.saved).toEqual([kopiC, milo])
})

it('sets the usual and the appearance', async () => {
  const { user, store } = renderApp(<Probe />, { data: defaultUserData() })
  await user.click(await screen.findByRole('button', { name: 'usual' }))
  await user.click(screen.getByRole('button', { name: 'dark' }))
  await user.click(screen.getByRole('button', { name: 'matcha' }))
  const saved = (await store.load())!
  expect(saved.usual).toEqual(kopiC)
  expect(saved.settings).toEqual({ theme: 'dark', scheme: 'matcha' })
})

it('tidies saved data against the content on load', async () => {
  const data: UserData = { ...defaultUserData(), saved: [{ drinkId: 'gone', choices: {} }, kopiC] }
  renderApp(<Probe />, { data })
  expect(await screen.findByTestId('saved')).toHaveTextContent('kopi{"milk":"c"}')
  expect(screen.getByTestId('saved')).not.toHaveTextContent('gone')
})

it('keeps working, in memory, when a save fails after loading', async () => {
  const store = { ...createMemoryStore(defaultUserData()), persistent: true, save: vi.fn().mockRejectedValue(new Error('quota')) }
  const { user } = renderApp(<Probe />, { store })
  expect(await screen.findByTestId('persistent')).toHaveTextContent('true')
  await user.click(screen.getByRole('button', { name: 'save milo' }))
  expect(screen.getByTestId('saved')).toHaveTextContent('milo')
  expect(await screen.findByTestId('persistent')).toHaveTextContent('false')
})
