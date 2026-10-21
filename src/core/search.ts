import { CHOICE_GROUPS, OPTIONS } from '../content/choices'
import type { Content, Drink, DrinkGroup, Ingredient, Room } from '../content/schema'
import { caffeineOf } from './caffeine'
import { resolveOrder } from './order'

export type DrinkFilters = { room: Room; query: string; group?: DrinkGroup; noCaffeine: boolean }

/**
 * Lowercase, without accents or punctuation, with single spaces, keeping Chinese characters, so
 * "Kopi-O, Kosong!" and "kopi o kosong" match and "咖啡" is still something to search for.
 */
export function normalise(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/['’‘`]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\p{Script=Han}]+/gu, ' ')
    .trim()
}

/** Everything a search can match a drink by: its names, its ingredients and the words of the options it offers. */
function haystack(drink: Drink, byId: ReadonlyMap<string, Ingredient>): string {
  const words = CHOICE_GROUPS.flatMap((g) =>
    (drink.choices[g]?.options ?? []).map((id) => OPTIONS[g].find((o) => o.id === id)?.word ?? ''),
  )
  const ingredients = drink.ingredients.map((l) => byId.get(l.ingredientId)?.name ?? '')
  return normalise([drink.name, drink.chinese ?? '', ...ingredients, ...words].join(' '))
}

/** The drinks of a room that match every word of the query and the filters, in content order. */
export function filterDrinks(content: Content, filters: DrinkFilters, byId: ReadonlyMap<string, Ingredient>): Drink[] {
  const words = normalise(filters.query).split(' ').filter(Boolean)
  return content.drinks.filter(
    (d) =>
      d.room === filters.room &&
      (!filters.group || d.group === filters.group) &&
      (!filters.noCaffeine || caffeineOf(resolveOrder(d).lines, byId).mg === 0) &&
      (words.length === 0 || words.every((w) => haystack(d, byId).includes(w))),
  )
}
