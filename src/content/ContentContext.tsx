import { createContext, useContext } from 'react'
import { content as shippedContent } from './index'
import type { Content, Drink, Ingredient, Term } from './schema'

export type ContentValue = {
  content: Content
  ingredientById: ReadonlyMap<string, Ingredient>
  drinkById: ReadonlyMap<string, Drink>
  termById: ReadonlyMap<string, Term>
}

export function makeContentValue(content: Content): ContentValue {
  return {
    content,
    ingredientById: new Map(content.ingredients.map((i) => [i.id, i])),
    drinkById: new Map(content.drinks.map((d) => [d.id, d])),
    termById: new Map(content.terms.map((t) => [t.id, t])),
  }
}

/** The drinks, ingredients and terms in use. Defaults to the shipped content; tests supply a small set. */
export const ContentContext = createContext<ContentValue>(makeContentValue(shippedContent))

export const ContentProvider = ContentContext.Provider

export const useContent = () => useContext(ContentContext)
