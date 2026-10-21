import type { Room } from '../content/schema'
import {
  CAFE_PALETTES,
  CAFE_SCHEMES,
  KOPITIAM_PALETTE,
  THEMES,
  type CafeScheme,
  type KopitiamPalette,
  type Mode,
  type Theme,
} from './palettes'

const CSS_NAMES: Record<keyof KopitiamPalette, string> = {
  bg: '--bg',
  surface: '--surface',
  text: '--text',
  muted: '--muted',
  line: '--line',
  controlLine: '--control-line',
  accent: '--accent',
  onAccent: '--on-accent',
  good: '--good',
  warnBg: '--warn-bg',
  warnText: '--warn-text',
  glow: '--glow',
  header: '--header',
  onHeader: '--on-header',
  seal: '--seal',
  track: '--track',
  pill: '--pill',
  onPill: '--on-pill',
}

// A copy of the choice kept where it can be read instantly, so the page does not flash the default
// colours while the saved data loads.
const CACHE_KEY = 'kopi-kaki-appearance'

const deviceIsDark = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false

export function resolveMode(theme: Theme): Mode {
  if (theme === 'system') return deviceIsDark() ? 'dark' : 'light'
  return theme
}

/** Which room's colours a page uses. Shared screens (Saved, Settings, Terms) use the café scheme. */
export function roomForPath(pathname: string): Room {
  return pathname === '/' || pathname.startsWith('/kopitiam/') || pathname === '/words' ? 'kopitiam' : 'cafe'
}

function paintPage(theme: Theme, scheme: CafeScheme, room: Room): void {
  const root = document.documentElement
  const mode = resolveMode(theme)
  const palette: Partial<KopitiamPalette> = room === 'kopitiam' ? KOPITIAM_PALETTE[mode] : CAFE_PALETTES[scheme][mode]
  for (const key of Object.keys(CSS_NAMES) as (keyof KopitiamPalette)[]) {
    const value = palette[key]
    if (value) root.style.setProperty(CSS_NAMES[key], value)
    else root.style.removeProperty(CSS_NAMES[key])
  }
  root.style.colorScheme = mode
  root.dataset.theme = mode
  root.dataset.room = room
}

/** Recolours the page for a room. Returns a function that stops following the device's light or dark setting. */
export function applyTheme(theme: Theme, scheme: CafeScheme, room: Room): () => void {
  const paint = () => paintPage(theme, scheme, room)
  paint()
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ theme, scheme }))
  } catch {
    // Without the copy the page still works; it only shows the default colours for a moment on opening.
  }

  if (theme !== 'system' || !window.matchMedia) return () => {}
  const device = window.matchMedia('(prefers-color-scheme: dark)')
  device.addEventListener('change', paint)
  return () => device.removeEventListener('change', paint)
}

/** Applies the last choice made on this device, before the saved data has loaded. */
export function applyCachedTheme(room: Room): void {
  try {
    const cached = JSON.parse(localStorage.getItem(CACHE_KEY) ?? 'null')
    const theme = THEMES.find((t) => t === cached?.theme)
    const scheme = CAFE_SCHEMES.find((s) => s === cached?.scheme)
    if (theme && scheme) paintPage(theme, scheme, room)
  } catch {
    // Nothing cached, or storage is unavailable: the stylesheet's colours apply.
  }
}
