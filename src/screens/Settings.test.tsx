import { screen } from '@testing-library/react'
import App from '../App'
import { serialiseBackup } from '../storage/backup'
import { defaultUserData, type UserData } from '../storage/userData'
import { expectAccessible, renderApp } from '../test/render'

const feedback = vi.hoisted(() => ({ url: '' }))
vi.mock('../config', () => ({
  APP_NAME: 'Kopi Kaki',
  get FEEDBACK_URL() {
    return feedback.url
  },
}))

const mine: UserData = { ...defaultUserData(), saved: [{ drinkId: 'milo', choices: {} }] }
const theirs: UserData = {
  ...defaultUserData(),
  saved: [
    { drinkId: 'kopi', choices: { milk: 'o' } },
    { drinkId: 'flat-white', choices: {} },
  ],
  settings: { theme: 'dark', scheme: 'peng' },
}

const open = async () => {
  const view = renderApp(<App />, { data: mine, route: '/settings' })
  await screen.findByRole('heading', { level: 1, name: 'Settings' })
  return view
}
const upload = (user: Awaited<ReturnType<typeof open>>['user'], text: string) =>
  user.upload(screen.getByLabelText(/import a backup/i), new File([text], 'backup.json', { type: 'application/json' }))

afterEach(() => {
  feedback.url = ''
  vi.restoreAllMocks()
})

it('switches theme and café colours, and saves', async () => {
  const { user, store } = await open()
  expect(screen.getByRole('radio', { name: 'Match my device' })).toBeChecked()
  await user.click(screen.getByRole('radio', { name: 'Dark' }))
  expect(screen.getByRole('group', { name: 'Café colours' })).toBeInTheDocument()
  expect(
    ['Kopi', 'Barley', 'Shophouse', 'Matcha', 'Bandung', 'Peng', 'Gula Melaka'].map((n) =>
      screen.getByRole('radio', { name: n }),
    ),
  ).toHaveLength(7)
  await user.click(screen.getByRole('radio', { name: 'Matcha' }))
  expect((await store.load())!.settings).toEqual({ theme: 'dark', scheme: 'matcha' })
})

it('export downloads the saved data as a dated file', async () => {
  let exported: Blob | undefined
  URL.createObjectURL = vi.fn((blob: Blob) => {
    exported = blob
    return 'blob:backup'
  })
  URL.revokeObjectURL = vi.fn()
  let download = ''
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
    download = this.download
  })
  const { user } = await open()
  await user.click(screen.getByRole('button', { name: /export a backup/i }))
  expect(download).toMatch(/^kopi-kaki-backup-\d{4}-\d{2}-\d{2}\.json$/)
  expect(JSON.parse(await exported!.text())).toEqual(mine)
})

it('import asks first, then replaces and tidies', async () => {
  const { user, store } = await open()
  await upload(user, serialiseBackup({ ...theirs, saved: [...theirs.saved, { drinkId: 'gone', choices: {} }] }))
  expect(await screen.findByRole('alertdialog')).toHaveTextContent(/3 saved drinks/i)
  expect(await store.load()).toEqual(mine)
  await user.click(screen.getByRole('button', { name: /replace my data/i }))
  expect(await store.load()).toEqual(theirs)
  expect(screen.getByText(/backup restored/i)).toBeInTheDocument()
})

it('cancelling import leaves data untouched', async () => {
  const { user, store } = await open()
  await upload(user, serialiseBackup(theirs))
  await user.click(await screen.findByRole('button', { name: /cancel/i }))
  expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
  expect(await store.load()).toEqual(mine)
})

it.each([
  ['not json', "That file isn't a Kopi Kaki backup."],
  [JSON.stringify({ ...theirs, version: 2 }), 'This backup is from a newer version of the app.'],
])('rejects %s', async (text, message) => {
  const { user, store } = await open()
  await upload(user, text)
  expect(await screen.findByRole('alert')).toHaveTextContent(message)
  expect(await store.load()).toEqual(mine)
})

it('reminds that clearing browser data erases saved drinks', async () => {
  await open()
  expect(screen.getByText(/clearing this browser's data erases/i)).toBeInTheDocument()
})

it('links to terms, and shows feedback only when there is a form', async () => {
  await open()
  expect(screen.getByRole('link', { name: /terms and privacy/i })).toHaveAttribute('href', '/terms')
  expect(screen.queryByRole('link', { name: /send feedback/i })).not.toBeInTheDocument()
})

it('shows the feedback link when there is a form', async () => {
  feedback.url = 'https://example.com/form'
  await open()
  expect(screen.getByRole('link', { name: /send feedback/i })).toHaveAttribute('href', 'https://example.com/form')
})

it('has no axe violations', async () => {
  await open()
  await expectAccessible()
})
