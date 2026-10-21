import { z } from 'zod'
import type { Content } from '../content/schema'
import { normaliseChoices, resolveOrder } from '../core/order'
import { CAFE_SCHEMES, THEMES } from '../theme/palettes'

export const CURRENT_VERSION = 1

const savedDrinkSchema = z.object({ drinkId: z.string(), choices: z.record(z.string(), z.string()) })

const userDataSchema = z.object({
  version: z.literal(CURRENT_VERSION),
  saved: z.array(savedDrinkSchema),
  usual: savedDrinkSchema.nullable(),
  settings: z.object({ theme: z.enum(THEMES), scheme: z.enum(CAFE_SCHEMES) }),
})

/** A café drink, or a kopitiam order with the choices that differ from the drink's defaults. */
export type SavedDrink = z.infer<typeof savedDrinkSchema>
export type UserData = z.infer<typeof userDataSchema>
export type ParseResult = { ok: true; data: UserData } | { ok: false; reason: 'invalid' | 'newer-version' }

type Versioned = { version: number }

/** Upgrades saved data one version at a time. Keyed by the version being upgraded from. */
const migrations: Record<number, (old: Versioned) => Versioned> = {}

export function defaultUserData(): UserData {
  return { version: CURRENT_VERSION, saved: [], usual: null, settings: { theme: 'system', scheme: 'kopi' } }
}

export function parseUserData(raw: unknown): ParseResult {
  const invalid: ParseResult = { ok: false, reason: 'invalid' }
  const versioned = z.object({ version: z.number().int() }).loose().safeParse(raw)
  if (!versioned.success) return invalid
  if (versioned.data.version > CURRENT_VERSION) return { ok: false, reason: 'newer-version' }

  let current: Versioned = versioned.data
  while (current.version < CURRENT_VERSION) {
    const migrate = migrations[current.version]
    if (!migrate) return invalid
    current = migrate(current)
  }

  const parsed = userDataSchema.safeParse(current)
  return parsed.success ? { ok: true, data: parsed.data } : invalid
}

const sameChoices = (a: Record<string, string>, b: Record<string, string>) =>
  Object.keys(a).length === Object.keys(b).length && Object.entries(a).every(([k, v]) => b[k] === v)

export function sameDrink(a: SavedDrink, b: SavedDrink): boolean {
  return a.drinkId === b.drinkId && sameChoices(a.choices, b.choices)
}

/**
 * Brings saved data in line with the current content: drinks that no longer exist go, choices are
 * resolved again (so an option a drink dropped, or a pair that is now blocked, falls back to the
 * default) and kept only where they differ from it, and repeats are merged.
 */
export function tidyUserData(data: UserData, content: Content): UserData {
  const drinkById = new Map(content.drinks.map((d) => [d.id, d]))
  const tidy = (s: SavedDrink): SavedDrink | null => {
    const drink = drinkById.get(s.drinkId)
    if (!drink) return null
    return { drinkId: drink.id, choices: normaliseChoices(resolveOrder(drink, s.choices)) as Record<string, string> }
  }
  const saved: SavedDrink[] = []
  for (const s of data.saved) {
    const t = tidy(s)
    if (t && !saved.some((x) => sameDrink(x, t))) saved.push(t)
  }
  return { ...data, saved, usual: data.usual ? tidy(data.usual) : null }
}
