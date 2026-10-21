export const THEMES = ['system', 'light', 'dark'] as const
export const CAFE_SCHEMES = ['kopi', 'barley', 'shophouse', 'matcha', 'bandung', 'peng', 'gula-melaka'] as const

export type Theme = (typeof THEMES)[number]
export type CafeScheme = (typeof CAFE_SCHEMES)[number]
export type Mode = 'light' | 'dark'

export type Palette = {
  bg: string
  surface: string
  text: string
  muted: string
  line: string
  /** Edges of fields and buttons: 3:1 or better against the page and surfaces. */
  controlLine: string
  accent: string
  onAccent: string
  good: string
  warnBg: string
  warnText: string
  /** A soft wash of colour behind the top of the page. Decorative, so not contrast-checked. */
  glow: string
}

/** The Kopitiam room adds its signboard header, the vermilion seal and the choice controls. */
export type KopitiamPalette = Palette & {
  header: string
  onHeader: string
  seal: string
  track: string
  pill: string
  onPill: string
}

// Shared by every palette: "No caffeine", the caffeine note and step cautions.
const STATUS = {
  light: { good: '#2b6655', warnBg: '#f6ecd8', warnText: '#5a3d12' },
  dark: { good: '#79b9a3', warnBg: '#3d2c12', warnText: '#f3d9a6' },
}

/** bg, surface, text, muted, line, controlLine, accent, glow — in that order, as in the spec's table. */
type Row = [string, string, string, string, string, string, string, string]

function palette(mode: Mode, [bg, surface, text, muted, line, controlLine, accent, glow]: Row): Palette {
  return { bg, surface, text, muted, line, controlLine, accent, onAccent: mode === 'light' ? '#ffffff' : bg, glow, ...STATUS[mode] }
}

const scheme = (name: string, light: Row, dark: Row) => ({ name, light: palette('light', light), dark: palette('dark', dark) })

// From the owner's inspiration boards: each board's own colours make the background, lines and glow;
// text, accent and edges are darkened (or lightened, in dark) only as far as WCAG AA needs.
// palettes.test.ts checks every pairing the app uses.
export const CAFE_PALETTES: Record<CafeScheme, { name: string; light: Palette; dark: Palette }> = {
  kopi: scheme(
    'Kopi',
    ['#f5f1ea', '#fbf9f6', '#4a342a', '#644737', '#d7c9b8', '#99877a', '#7d5a44', '#d7c9b8'],
    ['#1c1410', '#31221c', '#f5f1ea', '#d7c9b8', '#413832', '#786d63', '#d7c9b8', '#3e2d22'],
  ),
  barley: scheme(
    'Barley',
    ['#f6f0e6', '#fbf8f4', '#3b3128', '#6b5b4d', '#e0d1b8', '#968977', '#7d6a5b', '#efe3ce'],
    ['#16130f', '#27211a', '#f6f0e6', '#e0d1b8', '#3e3931', '#736b5d', '#efe3ce', '#443b32'],
  ),
  shophouse: scheme(
    'Shophouse',
    ['#f1eee8', '#f9f7f5', '#3a2a1a', '#755837', '#dbc4a5', '#9b866d', '#876640', '#e0ab7f'],
    ['#16100a', '#261c11', '#f1eee8', '#dbc4a5', '#3d3429', '#746654', '#e0ab7f', '#4c3924'],
  ),
  matcha: scheme(
    'Matcha',
    ['#f3ede5', '#faf7f3', '#33332a', '#626253', '#dac4b0', '#948778', '#6d6d5c', '#bcbaa8'],
    ['#131310', '#21211c', '#f3ede5', '#dac4b0', '#3b3630', '#74695d', '#bcbaa8', '#3f3f35'],
  ),
  bandung: scheme(
    'Bandung',
    ['#f7efea', '#fbf8f6', '#3d2824', '#826459', '#dfc6ba', '#9d857c', '#84665b', '#dfc6ba'],
    ['#170f0e', '#281a18', '#f7efea', '#dfc6ba', '#3f3430', '#75655f', '#dfc6ba', '#54423a'],
  ),
  peng: scheme(
    'Peng',
    ['#f5efe7', '#fbf8f4', '#262c30', '#535a5e', '#d7d0c4', '#8b8984', '#676e72', '#b6b9b8'],
    ['#0e1112', '#191d20', '#f5efe7', '#d7d0c4', '#363736', '#696863', '#b6b9b8', '#363b3d'],
  ),
  'gula-melaka': scheme(
    'Gula Melaka',
    ['#f5ede4', '#fbf7f3', '#503523', '#7b5036', '#cfb59d', '#9f846f', '#946041', '#bf9377'],
    ['#1e140d', '#352317', '#f5ede4', '#cfb59d', '#41342a', '#806d5d', '#bf9377', '#4e3222'],
  ),
}

/** Marble and jade, with a teak signboard and a vermilion seal. The same whatever café scheme is chosen. */
export const KOPITIAM_PALETTE: Record<Mode, KopitiamPalette> = {
  light: {
    ...palette('light', ['#f1efe9', '#faf9f6', '#2b1d14', '#5f4c3f', '#dcd6cb', '#8f8578', '#2b6655', '#dcd6cb']),
    header: '#4b2f20',
    onHeader: '#f4ecdf',
    seal: '#a63d27',
    track: '#ebe6de',
    pill: '#fffdf8',
    onPill: '#1f4f42',
  },
  dark: {
    ...palette('dark', ['#191612', '#241f1a', '#f1ebe1', '#b9ab9a', '#3a332b', '#8a8072', '#79b9a3', '#3a332b']),
    onAccent: '#10201a',
    header: '#2a1a11',
    onHeader: '#f1e2c8',
    seal: '#a63d27',
    track: '#2c2620',
    pill: '#3a332b',
    onPill: '#cfe7dc',
  },
}
