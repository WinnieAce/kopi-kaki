import rawDrinks from './drinks.json'
import rawIngredients from './ingredients.json'
import rawTerms from './terms.json'
import type { Content, Drink, Ingredient, Term } from './schema'
import { validateContent } from './validate'

const result = validateContent({ ingredients: rawIngredients, drinks: rawDrinks, terms: rawTerms })
if (!result.ok) throw new Error(`Invalid content:\n${result.errors.join('\n')}`)

export const content: Content = result.content
export const ingredientById: ReadonlyMap<string, Ingredient> = new Map(content.ingredients.map((i) => [i.id, i]))
export const drinkById: ReadonlyMap<string, Drink> = new Map(content.drinks.map((d) => [d.id, d]))
export const termById: ReadonlyMap<string, Term> = new Map(content.terms.map((t) => [t.id, t]))
