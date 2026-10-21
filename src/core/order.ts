import { CHOICE_GROUPS, FACTORS, findOption, type ChoiceGroup } from '../content/choices'
import type { Caution, CupId, Drink, DrinkIngredient, Technique, When } from '../content/schema'

export type Choices = Partial<Record<ChoiceGroup, string>>
export type ResolvedLine = { ingredientId: string; amount: number; optional: boolean; note?: string }
export type ResolvedStep = { text: string; technique?: Technique; ingredientIds: string[]; caution?: Caution }
export type ResolvedOrder = {
  drink: Drink
  /** A value for every group the drink offers. */
  choices: Choices
  name: string
  meaning: string
  lines: ResolvedLine[]
  steps: ResolvedStep[]
  cup: CupId
  colour: string
  /** Why a requested choice was changed, such as Kosong with condensed milk. */
  notes: string[]
}

/** Clears floating-point dust such as 14.000000000000002, without rounding real amounts. */
const tidy = (n: number) => Math.round(n * 1e6) / 1e6

const matches = (when: When | undefined, choices: Choices) =>
  Object.entries(when ?? {}).every(([group, options]) => options.includes(choices[group as ChoiceGroup] ?? ''))

function factor(line: DrinkIngredient, choices: Choices): number {
  const strength = (choices.strength ?? 'normal') as keyof typeof FACTORS.strong
  switch (line.role) {
    case 'sweet':
      return FACTORS.sweet[(choices.sugar ?? 'normal') as keyof typeof FACTORS.sweet]
    case 'strong':
      return FACTORS.strong[strength]
    case 'dilute':
      return FACTORS.dilute[strength]
    default:
      return 1
  }
}

/** The reason `option` cannot be chosen for `group` while `choices` stand, or null if it can. */
export function isBlocked(drink: Drink, choices: Choices, group: ChoiceGroup, option: string): string | null {
  const block = drink.blocked.find(
    (b) => b.blocks.group === group && b.blocks.option === option && choices[b.chosen.group] === b.chosen.option,
  )
  return block?.reason ?? null
}

/**
 * Works out an order from the choices asked for. Anything the drink does not offer is ignored, and a
 * blocked pair falls back to the default with the reason in `notes`, so any request gives a valid order.
 */
export function resolveOrder(drink: Drink, requested: Record<string, string | undefined> = {}): ResolvedOrder {
  const choices: Choices = {}
  for (const group of CHOICE_GROUPS) {
    const setting = drink.choices[group]
    if (!setting) continue
    const asked = requested[group]
    choices[group] = asked !== undefined && setting.options.includes(asked) ? asked : setting.default
  }

  const notes: string[] = []
  for (const block of drink.blocked) {
    if (choices[block.chosen.group] === block.chosen.option && choices[block.blocks.group] === block.blocks.option) {
      choices[block.blocks.group] = drink.choices[block.blocks.group]!.default
      notes.push(block.reason)
    }
  }

  const lines: ResolvedLine[] = drink.ingredients
    .filter((line) => matches(line.when, choices))
    .map((line) => ({
      ingredientId: line.ingredientId,
      amount: tidy(line.amount * factor(line, choices)),
      optional: line.optional,
      ...(line.note ? { note: line.note } : {}),
    }))
    .filter((line) => line.amount > 0)

  const present = new Set(lines.map((l) => l.ingredientId))
  const steps: ResolvedStep[] = drink.steps
    .filter((step) => matches(step.when, choices))
    .filter((step) => step.ingredientIds.length === 0 || step.ingredientIds.some((i) => present.has(i)))
    .map((step) => ({
      text: step.text,
      ingredientIds: step.ingredientIds.filter((i) => present.has(i)),
      ...(step.technique ? { technique: step.technique } : {}),
      ...(step.caution ? { caution: step.caution } : {}),
    }))

  const chosen = CHOICE_GROUPS.flatMap((g) => {
    const option = choices[g] ? findOption(g, choices[g]) : undefined
    return option ? [option] : []
  })

  return {
    drink,
    choices,
    name: [drink.name, ...chosen.map((o) => o.word)].filter(Boolean).join(' '),
    meaning: [drink.meaning, ...chosen.map((o) => o.meaning)].filter(Boolean).join(' · '),
    lines,
    steps,
    cup: choices.temp === 'peng' ? 'peng-glass' : drink.cup,
    colour: (choices.milk && drink.colourByMilk?.[choices.milk]) || drink.colour,
    notes,
  }
}

/** Only the choices that differ from the drink's defaults: what an address or a saved order keeps. */
export function normaliseChoices(order: ResolvedOrder): Choices {
  const result: Choices = {}
  for (const group of CHOICE_GROUPS) {
    const value = order.choices[group]
    if (value !== undefined && value !== order.drink.choices[group]?.default) result[group] = value
  }
  return result
}

/** The order's choices as an address query, such as `milk=c&temp=peng`, without the defaults. */
export function choicesToSearch(order: ResolvedOrder): string {
  return new URLSearchParams(Object.entries(normaliseChoices(order)) as [string, string][]).toString()
}

/** Choices from an address. The first value of a repeated key wins; unknown keys are left for resolveOrder to ignore. */
export function choicesFromSearch(params: URLSearchParams): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of new Set(params.keys())) result[key] = params.get(key)!
  return result
}
