// Content guards: checks that need more than the schema, run by the tests on the shipped content.
// Each returns readable problems, or an empty list when the content is clean.
import { CHOICE_GROUPS, type ChoiceGroup } from './choices'
import type { Content, Drink } from './schema'
import { caffeineOf } from '../core/caffeine'
import { resolveOrder, type Choices } from '../core/order'

/** Words that would bring alcohol into an app for children. Matched as whole words, so "ginger" is fine. */
export const ALCOHOL_WORDS = [
  'alcohol',
  'rum',
  'wine',
  'beer',
  'stout',
  'shandy',
  'liqueur',
  'liquor',
  'brandy',
  'whisky',
  'whiskey',
  'vodka',
  'gin',
  'tequila',
  'sake',
  'soju',
  'mirin',
  'bitters',
  'extract',
  'cocktail',
  'spirit',
  'spirits',
]

const ALCOHOL = new RegExp(`\\b(${ALCOHOL_WORDS.join('|')})\\b`, 'i')
const HOT = /\b(boil|boils|boiled|boiling|simmer|kettle|steam|steamed|hot water|hot milk)\b/i
const SHARP = /\b(knife|cut|slice|chop|peel)\b/i

/** Every piece of text in the content, labelled with where it lives. */
function texts(content: Content): [string, string][] {
  const out: [string, string][] = []
  for (const i of content.ingredients) {
    out.push([`ingredient "${i.id}" name`, i.name], [`ingredient "${i.id}" description`, i.description])
    if (i.caffeineSource) out.push([`ingredient "${i.id}" caffeineSource`, i.caffeineSource])
  }
  for (const d of content.drinks) {
    const at = `drink "${d.id}"`
    out.push([`${at} name`, d.name], [`${at} meaning`, d.meaning], [`${at} about`, d.about])
    d.ingredients.forEach((l, n) => l.note && out.push([`${at} ingredient ${n + 1} note`, l.note]))
    d.steps.forEach((s, n) => out.push([`${at} step ${n + 1}`, s.text]))
    d.tools.forEach((t) => out.push([`${at} tool`, t.name], [`${at} tool alternative`, t.alternative]))
    d.blocked.forEach((b) => out.push([`${at} block reason`, b.reason]))
  }
  for (const t of content.terms) {
    out.push([`term "${t.id}" word`, t.word], [`term "${t.id}" meaning`, t.meaning], [`term "${t.id}" origin`, t.origin])
    t.also.forEach((a) => out.push([`term "${t.id}" also`, a]))
  }
  return out
}

export function alcoholWords(content: Content): string[] {
  return texts(content).flatMap(([where, text]) => {
    const found = text.match(ALCOHOL)
    return found ? [`${where} mentions "${found[1]}"`] : []
  })
}

/** Steps that mention boiling, steam, a kettle, hot water or hot milk need a hot caution; knives a sharp one. */
export function missingCautions(content: Content): string[] {
  return content.drinks.flatMap((d) =>
    d.steps.flatMap((s, n) => {
      const where = `drink "${d.id}" step ${n + 1}`
      const hot = HOT.test(s.text)
      const sharp = SHARP.test(s.text)
      if (hot && sharp) return [`${where} is both hot and sharp: split it into two steps`]
      if (hot && s.caution !== 'hot') return [`${where} mentions heat but has no hot caution`]
      if (sharp && s.caution !== 'sharp') return [`${where} mentions a knife but has no sharp caution`]
      return []
    }),
  )
}

/** Di Lo means no added water, so a drink offers it exactly when its recipe adds water to dilute it. */
export function diLoMismatches(content: Content): string[] {
  return content.drinks.flatMap((d) => {
    const offers = d.choices.strength?.options.includes('di-lo') ?? false
    const adds = d.ingredients.some((l) => l.role === 'dilute')
    if (offers && !adds) return [`drink "${d.id}" offers Di Lo but adds no water to leave out`]
    if (adds && !offers) return [`drink "${d.id}" adds water but does not offer Di Lo`]
    return []
  })
}

/** Every combination of the options a drink offers, blocked pairs included. A café drink has one: no choices. */
export function allCombinations(drink: Drink): Choices[] {
  const groups = CHOICE_GROUPS.filter((g) => drink.choices[g])
  return groups.reduce<Choices[]>(
    (combos, group: ChoiceGroup) => combos.flatMap((c) => drink.choices[group]!.options.map((o) => ({ ...c, [group]: o }))),
    [{}],
  )
}

/** Every combination must give a named order with ingredients, each used in a step, and sensible caffeine. */
export function combinationProblems(content: Content): string[] {
  const byId = new Map(content.ingredients.map((i) => [i.id, i]))
  const problems = new Set<string>()
  for (const drink of content.drinks) {
    for (const combo of allCombinations(drink)) {
      const order = resolveOrder(drink, combo)
      const where = `drink "${drink.id}" ${JSON.stringify(order.choices)}`
      if (!order.name) problems.add(`${where} has no name`)
      if (order.lines.length === 0) problems.add(`${where} has no ingredients`)
      const ids = order.lines.map((l) => l.ingredientId)
      if (new Set(ids).size !== ids.length) problems.add(`${where} lists an ingredient twice`)
      const inSteps = new Set(order.steps.flatMap((s) => s.ingredientIds))
      for (const id of ids) if (!inSteps.has(id)) problems.add(`${where}: "${id}" is not used in any step`)
      // An unknown ingredient would silently drop out of the allergen list.
      if (ids.some((id) => !byId.has(id))) problems.add(`${where} uses an unknown ingredient`)
      if (!Number.isFinite(caffeineOf(order.lines, byId).mg)) problems.add(`${where} has no caffeine figure`)
    }
  }
  return [...problems]
}
