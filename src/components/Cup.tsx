import type { ReactNode } from 'react'
import type { CupId } from '../content/schema'
import type { CupExtras } from '../core/cupExtras'

// Ink-line drawings in a 64 x 64 box: outlines with flat colour, as approved in the design mock-ups.
// Porcelain is outlined with --cup-line (dark ink, even in dark mode, so the white cup keeps its
// shape); glass and handles use the text colour. Each cup with a saucer rests its base on the
// saucer's centre line.

const WARE = '#fffdf8'
const JADE = '#2b6655'
const VERMILION = '#a63d27'

const steam = (y: number, xs: number[]) =>
  xs.map((x) => <path key={x} className="steam" d={`M${x} ${y}q-2-2.5 0-5t0-5`} strokeWidth="1.1" strokeOpacity="0.45" />)

const ice = (cubes: [number, number, number][]) =>
  cubes.map(([x, y, r]) => (
    <rect
      key={`${x},${y}`}
      className="ice"
      x={x}
      y={y}
      width="7.5"
      height="7.5"
      rx="1.6"
      fill="#ffffff"
      fillOpacity="0.6"
      strokeWidth="0.6"
      strokeOpacity="0.6"
      transform={`rotate(${r} ${x + 3.75} ${y + 3.75})`}
    />
  ))

const porcelain = { fill: WARE, stroke: 'var(--cup-line)' }

function drawing(cup: CupId, colour: string, e: CupExtras): ReactNode {
  switch (cup) {
    case 'kopitiam-cup':
      return (
        <>
          {e.steam && steam(17.5, [27, 37])}
          <ellipse cx="32" cy="52" rx="26" ry="5.5" {...porcelain} />
          <path d="M14 24.5h36c0 11-3.5 21-9 27.5H23c-5.5-6.5-9-16.5-9-27.5z" {...porcelain} />
          <path d="M49.4 29.5c7.5 0 8 11.5 0 12.5" />
          <ellipse className="drink" cx="32" cy="24.5" rx="18" ry="3" fill={colour} stroke="var(--cup-line)" />
          <path d="M14.7 32h34.6" stroke={JADE} strokeWidth="3" />
          <path d="M14.3 27.3h35.4" stroke={VERMILION} strokeWidth="0.9" />
        </>
      )
    case 'peng-glass':
      return (
        <>
          <path className="drink" d="M20.6 17h20.8l-1.6 37.4a2.6 2.6 0 0 1-2.6 2.4H24.8a2.6 2.6 0 0 1-2.6-2.4z" fill={colour} stroke="none" />
          {e.ice && ice([[22.5, 15.5, -8], [31.5, 17.5, 10], [25.5, 24.5, 4]])}
          <path d="M19 9h24l-1.8 45.6a3 3 0 0 1-3 2.9H23.8a3 3 0 0 1-3-2.9z" fill="rgba(255,255,255,.14)" />
          <path d="M42.6 20h3.4a4.5 4.5 0 0 1 4.5 4.5v13a4.5 4.5 0 0 1-4.5 4.5h-4.4" />
          <path d="M22.6 13 L24.2 51" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.65" />
        </>
      )
    case 'cafe-cup':
      return (
        <>
          {e.steam && steam(22, [27, 37])}
          <ellipse cx="32" cy="50" rx="27" ry="5" {...porcelain} />
          <path d="M11 29h42c-.8 12-7 21-21 21S11.8 41 11 29z" {...porcelain} />
          <path d="M52.3 33.5c6.5 0 6.5 9.5-2 10.5" />
          <ellipse className="drink" cx="32" cy="29" rx="21" ry="3.8" fill={colour} stroke="var(--cup-line)" />
          {e.latteArt && (
            <path
              className="latte-art"
              d="M32 31.8c-3.4-1.8-4-4.1-1.9-4.5.8-.2 1.6.3 1.9.9.3-.6 1.1-1.1 1.9-.9 2.1.4 1.5 2.7-1.9 4.5z"
              fill="#f5ead9"
              stroke="none"
            />
          )}
        </>
      )
    case 'tall-glass':
      return (
        <>
          <path className="drink" d="M18.2 14h27.6l-1.8 41.6a2 2 0 0 1-2 1.9H22a2 2 0 0 1-2-1.9z" fill={colour} stroke="none" />
          {e.ice && ice([[21, 13, -10], [33, 15, 12], [26, 21, 5]])}
          {e.straw && <path className="straw" d="M36.5 15.5 L47.5 1.5" stroke="#7d9f7a" strokeWidth="2.4" />}
          <path d="M17 8h30l-2.6 47.6a2.6 2.6 0 0 1-2.6 2.4H22.2a2.6 2.6 0 0 1-2.6-2.4z" fill="rgba(255,255,255,.14)" />
          <path d="M20.5 12 L22.4 53" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.65" />
        </>
      )
    case 'mug':
      return (
        <>
          {e.steam && steam(13, [25, 33])}
          <path d="M13 19h32v27a9 9 0 0 1-9 9H22a9 9 0 0 1-9-9z" {...porcelain} />
          <path d="M45 25h3.5a6.5 6.5 0 0 1 0 13H45" />
          <ellipse className="drink" cx="29" cy="19" rx="16" ry="3.2" fill={colour} stroke="var(--cup-line)" />
          {e.foam && <path className="foam" d="M23.5 19.4c2.4-1.8 8.6-1.8 11 0" stroke="#eef0dc" strokeWidth="1.3" />}
        </>
      )
  }
}

const NONE: CupExtras = { ice: false, steam: false, straw: false, latteArt: false, foam: false }

/**
 * The cup or glass a drink is served in, filled with the drink's colour. With `extras` it comes to
 * life: steam rises off a hot drink and ice bobs in a cold one. Decorative: the drink is named in text.
 */
export function Cup({ cup, colour, extras = NONE, id }: { cup: CupId; colour: string; extras?: CupExtras; id?: string }) {
  return (
    <svg
      className="cup"
      data-cup={id}
      data-kind={cup}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {drawing(cup, colour, extras)}
    </svg>
  )
}
