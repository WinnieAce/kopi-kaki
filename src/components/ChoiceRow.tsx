import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { GROUP_LABELS, type ChoiceGroup, type ChoiceOption } from '../content/choices'

const CALLOUT_MS = 5000

/**
 * One row of the order builder: a labelled radio group drawn as a soft track with a raised pill on the
 * chosen option. An option that cannot go with the current choices stays in its place, faded; choosing
 * it explains why in a callout instead of changing anything.
 */
export function ChoiceRow({
  group,
  options,
  value,
  blockedReason,
  onChange,
  note = null,
}: {
  group: ChoiceGroup
  options: readonly ChoiceOption[]
  value: string
  blockedReason: (optionId: string) => string | null
  onChange: (optionId: string) => void
  /** A message to show in the same callout, such as why a choice was moved back. */
  note?: string | null
}) {
  const [message, setMessage] = useState<{ text: string; at: number } | null>(null)
  const timer = useRef(0)
  const inputs = useRef<(HTMLInputElement | null)[]>([])
  const index = Math.max(0, options.findIndex((o) => o.id === value))

  const show = (text: string, at: number) => {
    setMessage({ text, at })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(null), CALLOUT_MS)
  }

  // A note from outside appears like a blocked reason, under the current choice.
  useEffect(() => {
    if (note) show(note, index)
    // Only a new note should open the callout, not a change of choice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [note])

  // The callout closes on the next touch anywhere, or after a few seconds.
  useEffect(() => {
    if (!message) return
    const close = () => setMessage(null)
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [message])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const choose = (at: number) => {
    const option = options[at]
    const reason = blockedReason(option.id)
    if (reason) {
      show(reason, at)
      return false
    }
    setMessage(null)
    if (option.id !== value) onChange(option.id)
    return true
  }

  // Arrow keys move between options as in any radio group, but never onto a blocked one.
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key]
    if (!step) return
    event.preventDefault()
    const at = (index + step + options.length) % options.length
    if (choose(at)) inputs.current[at]?.focus()
  }

  const name = `choice-${group}`
  return (
    <fieldset className="choice-row">
      <legend>{GROUP_LABELS[group]}</legend>
      <div className="seg" style={{ '--n': options.length, '--i': index } as CSSProperties} onKeyDown={onKeyDown}>
        <span className="seg-pill" aria-hidden="true" />
        {options.map((option, at) => {
          const blocked = blockedReason(option.id) !== null
          return (
            <label key={option.id} className="seg-option">
              <input
                ref={(el) => {
                  inputs.current[at] = el
                }}
                type="radio"
                name={name}
                value={option.id}
                checked={option.id === value}
                aria-disabled={blocked ? 'true' : undefined}
                onChange={() => choose(at)}
                onClick={(event) => {
                  // A blocked option is still clickable so it can explain itself; keep it unchecked.
                  if (blocked) {
                    event.preventDefault()
                    choose(at)
                  }
                }}
              />
              <span>{option.label}</span>
            </label>
          )
        })}
      </div>
      {message && (
        <p
          className="choice-callout"
          role="status"
          style={{ '--at': message.at, '--n': options.length } as CSSProperties}
        >
          {message.text}
        </p>
      )}
    </fieldset>
  )
}
