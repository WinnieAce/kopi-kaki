import type { Room } from '../content/schema'
import {
  CAFFEINE_ESTIMATE_NOTE,
  COCOA_NOTE,
  HIGH_CAFFEINE_NOTE,
  HIGH_CAFFEINE_NOTE_CAFE,
  LEVEL_NAMES,
  type Caffeine,
} from '../core/caffeine'

/** Caffeine for one serving: the figure, its level in words, and a gentle note on high-caffeine drinks. */
export function CaffeineInfo({ caffeine, room }: { caffeine: Caffeine; room: Room }) {
  return (
    <section className="caffeine stack-sm" aria-labelledby="caffeine-heading">
      <h2 id="caffeine-heading" className="label">
        Caffeine
      </h2>
      <p className={`caffeine-figure ${caffeine.level}`}>
        {caffeine.level === 'none' ? (
          <strong>No caffeine</strong>
        ) : (
          <>
            <strong>{caffeine.label}</strong> <span className="caffeine-level">{LEVEL_NAMES[caffeine.level]}</span>
          </>
        )}
      </p>
      {caffeine.fromCocoaOnly && caffeine.level === 'low' && <p className="small muted">{COCOA_NOTE}</p>}
      {caffeine.level === 'high' && <p className="caffeine-note">{room === 'cafe' ? HIGH_CAFFEINE_NOTE_CAFE : HIGH_CAFFEINE_NOTE}</p>}
      {caffeine.level !== 'none' && <p className="small muted">{CAFFEINE_ESTIMATE_NOTE}</p>}
    </section>
  )
}
