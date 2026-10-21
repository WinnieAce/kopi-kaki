import { ALLERGENS, type Allergen, type Ingredient } from '../content/schema'
import type { ResolvedLine } from './order'

export const ALLERGEN_LABEL_NOTE = 'Check the label: brands differ.'
export const NO_ALLERGENS = 'None of the four common allergens (dairy, soy, gluten, nuts).'

/** Every allergen in these lines, optional ones included, once each, in the order dairy, soy, gluten, nuts. */
export function orderAllergens(lines: ResolvedLine[], byId: ReadonlyMap<string, Ingredient>): Allergen[] {
  const found = new Set(lines.flatMap((l) => byId.get(l.ingredientId)?.allergens ?? []))
  return ALLERGENS.filter((a) => found.has(a))
}
