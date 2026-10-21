export const THEMES = ['system', 'light', 'dark'] as const
export const CAFE_SCHEMES = ['kopi', 'barley', 'shophouse', 'matcha', 'bandung', 'peng', 'gula-melaka'] as const

export type Theme = (typeof THEMES)[number]
export type CafeScheme = (typeof CAFE_SCHEMES)[number]
