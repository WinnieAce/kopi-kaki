import type { Unit } from '../content/schema'

export const MIN_SERVINGS = 1
export const MAX_SERVINGS = 8

const QUARTERS = ['', '¼', '½', '¾']

export function clampServings(n: number): number {
  if (Number.isNaN(n)) return MIN_SERVINGS
  return Math.min(MAX_SERVINGS, Math.max(MIN_SERVINGS, Math.round(n)))
}

export function scaleAmount(amount: number, servings: number): number {
  return amount * servings
}

const plain = (n: number) => String(Math.round(n * 100) / 100)

/** Nearest 2.5 ml below 30 ml and nearest 5 ml from there, so 22.5 ml survives; never less than 2.5 ml. */
function formatMl(amount: number): string {
  const step = amount < 30 ? 2.5 : 5
  return `${plain(Math.max(2.5, Math.round(amount / step) * step))} ml`
}

/** Whole grams from 10 g, half grams below; never less than 0.5 g. */
function formatGrams(amount: number): string {
  const rounded = amount >= 10 ? Math.round(amount) : Math.round(amount * 2) / 2
  return `${plain(Math.max(0.5, rounded))} g`
}

/** Nearest quarter, written with fraction glyphs and no space: 1½. Never less than ¼. */
function quarters(amount: number): string {
  const count = Math.max(1, Math.round(amount * 4))
  const whole = Math.floor(count / 4)
  return `${whole === 0 ? '' : whole}${QUARTERS[count % 4]}`
}

export function formatMeasure(amount: number, unit: Unit): string {
  switch (unit) {
    case 'ml':
      return formatMl(amount)
    case 'g':
      return formatGrams(amount)
    case 'tsp':
    case 'tbsp':
      return `${quarters(amount)} ${unit}`
    case 'piece':
      return quarters(amount)
  }
}
