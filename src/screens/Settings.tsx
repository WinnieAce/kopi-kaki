import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import { APP_NAME, FEEDBACK_URL } from '../config'
import { crossFade } from '../hooks/viewTransition'
import { backupFileName, parseBackup, serialiseBackup } from '../storage/backup'
import type { UserData } from '../storage/userData'
import { useUserData } from '../storage/UserDataContext'
import { resolveMode } from '../theme/applyTheme'
import { CAFE_PALETTES, CAFE_SCHEMES } from '../theme/palettes'

const count = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

const THEME_LABELS = [
  ['system', 'Match my device'],
  ['light', 'Light'],
  ['dark', 'Dark'],
] as const

export function Settings() {
  const { data, setTheme, setScheme, replaceAll } = useUserData()
  const [pending, setPending] = useState<UserData | null>(null)
  const [error, setError] = useState('')
  const [restored, setRestored] = useState(false)
  const cancelButton = useRef<HTMLButtonElement>(null)
  const importInput = useRef<HTMLInputElement>(null)
  const mode = resolveMode(data.settings.theme)

  useEffect(() => {
    if (pending) cancelButton.current?.focus()
  }, [pending])

  const exportBackup = () => {
    const url = URL.createObjectURL(new Blob([serialiseBackup(data)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = backupFileName(new Date())
    link.click()
    URL.revokeObjectURL(url)
  }

  const importBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.target
    const file = input.files?.[0]
    if (!file) return
    setError('')
    setRestored(false)
    setPending(null)

    const text = await file.text().catch(() => '')
    // Clear the input so choosing the same file again still triggers a change.
    input.value = ''
    const parsed = parseBackup(text)
    if (parsed.ok) setPending(parsed.data)
    else if (parsed.reason === 'newer-version')
      setError('This backup is from a newer version of the app. Reload to update the app, then try again.')
    else setError(`That file isn't a ${APP_NAME} backup. Choose a file you exported from this app.`)
  }

  const closeDialog = () => {
    setPending(null)
    importInput.current?.focus()
  }

  const confirmImport = () => {
    if (!pending) return
    // The provider tidies the data against the current drinks, so anything that no longer exists drops out.
    replaceAll(pending)
    setRestored(true)
    closeDialog()
  }

  return (
    <div className="stack">
      <h1>Settings</h1>

      <fieldset className="options">
        <legend>Theme</legend>
        {THEME_LABELS.map(([theme, label]) => (
          <label key={theme} className="option">
            <input
              type="radio"
              name="theme"
              checked={data.settings.theme === theme}
              // Light and dark ease over rather than flashing.
              onChange={() => crossFade(() => setTheme(theme))}
            />
            {label}
          </label>
        ))}
      </fieldset>

      <fieldset className="options">
        <legend>Café colours</legend>
        <p className="small muted">The Kopitiam room always uses its marble and jade.</p>
        {CAFE_SCHEMES.map((scheme) => (
          <label key={scheme} className="option">
            <input
              type="radio"
              name="scheme"
              checked={data.settings.scheme === scheme}
              onChange={() => setScheme(scheme)}
            />
            {CAFE_PALETTES[scheme].name}
            <span className="swatches" aria-hidden="true">
              {(['bg', 'glow', 'accent', 'text'] as const).map((part) => (
                <span key={part} style={{ background: CAFE_PALETTES[scheme][mode][part] }} />
              ))}
            </span>
          </label>
        ))}
      </fieldset>

      <section className="stack-sm" aria-labelledby="backup-heading">
        <h2 id="backup-heading">Backup</h2>
        <p>
          Your saved drinks and settings live only on this device. Clearing this browser's data erases them, so export a
          backup now and then.
        </p>
        <div className="row">
          <button className="button" onClick={exportBackup}>
            Export a backup
          </button>
          <label className="button">
            Import a backup
            <input
              ref={importInput}
              type="file"
              accept=".json,application/json"
              className="visually-hidden"
              onChange={importBackup}
            />
          </label>
        </div>
        {error && (
          <p className="notice" role="alert">
            {error}
          </p>
        )}
        {/* Always present, so screen readers announce the text when it appears. */}
        <p role="status">{restored && 'Backup restored.'}</p>
      </section>

      {pending && (
        <div className="scrim" onClick={closeDialog}>
          <div
            className="dialog stack-sm"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="import-title"
            aria-describedby="import-text"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.key === 'Escape' && closeDialog()}
          >
            <h2 id="import-title">Replace what is saved?</h2>
            <p id="import-text">
              This backup has {count(pending.saved.length, 'saved drink', 'saved drinks')}
              {pending.usual ? ' and a usual order' : ''}. It will replace what is saved on this device.
            </p>
            <div className="row">
              <button className="button primary" onClick={confirmImport}>
                Replace my data
              </button>
              <button className="button" ref={cancelButton} onClick={closeDialog}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="stack-sm" aria-labelledby="about-heading">
        <h2 id="about-heading">About</h2>
        <p>{APP_NAME} is free, has no accounts and collects no personal data.</p>
        <p>
          <Link to="/terms">Terms and privacy</Link>
        </p>
        {FEEDBACK_URL && (
          <p>
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer">
              Send feedback
            </a>
          </p>
        )}
      </section>
    </div>
  )
}
