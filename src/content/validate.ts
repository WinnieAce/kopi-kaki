import { CHOICE_GROUPS, OPTIONS, type ChoiceGroup } from './choices'
import { ROOM_GROUPS, contentSchema, type Content, type Drink, type When } from './schema'

export type ValidationResult = { ok: true; content: Content } | { ok: false; errors: string[] }

/** Ids that would clash with an address, such as /words. */
const RESERVED_DRINK_IDS = ['words']

function duplicates(ids: string[]): string[] {
  const seen = new Set<string>()
  const repeated = new Set<string>()
  for (const id of ids) (seen.has(id) ? repeated : seen).add(id)
  return [...repeated]
}

/** Problems with a drink's choices, blocks and conditions. */
function choiceErrors(drink: Drink): string[] {
  const errors: string[] = []
  const where = `drink "${drink.id}"`
  const allowed = (group: ChoiceGroup) => drink.choices[group]?.options ?? []
  const groups = Object.keys(drink.choices) as ChoiceGroup[]

  if (drink.room === 'cafe') {
    if (groups.length > 0 || drink.blocked.length > 0) errors.push(`${where} is a café drink and cannot offer choices`)
    const conditional = [...drink.ingredients, ...drink.steps].some((x) => x.when)
    if (conditional) errors.push(`${where} is a café drink and cannot have lines or steps that depend on choices`)
    return errors
  }

  for (const group of groups) {
    const setting = drink.choices[group]!
    const known = OPTIONS[group].map((o) => o.id)
    for (const o of setting.options) {
      if (!known.includes(o)) errors.push(`${where} ${group} option "${o}" is not a ${group} option`)
    }
    if (duplicates(setting.options).length > 0) errors.push(`${where} ${group} repeats an option`)
    if (setting.options.length < 2) errors.push(`${where} ${group} needs at least two options`)
    if (!setting.options.includes(setting.default)) errors.push(`${where} ${group} default "${setting.default}" is not one of its options`)
  }

  const checkWhen = (label: string, w: When | undefined) => {
    for (const [group, options] of Object.entries(w ?? {}) as [ChoiceGroup, string[]][]) {
      for (const o of options) {
        if (!allowed(group).includes(o)) errors.push(`${where} ${label} depends on ${group} "${o}", which the drink does not offer`)
      }
    }
  }
  drink.ingredients.forEach((line, n) => checkWhen(`ingredient ${n + 1}`, line.when))
  drink.steps.forEach((step, n) => checkWhen(`step ${n + 1}`, step.when))

  for (const block of drink.blocked) {
    const { chosen, blocks } = block
    if (CHOICE_GROUPS.indexOf(chosen.group) >= CHOICE_GROUPS.indexOf(blocks.group)) {
      errors.push(`${where} block: the ${chosen.group} choice must come before the ${blocks.group} choice it blocks`)
    }
    if (!allowed(chosen.group).includes(chosen.option)) errors.push(`${where} block names ${chosen.group} "${chosen.option}", which the drink does not offer`)
    if (!allowed(blocks.group).includes(blocks.option)) errors.push(`${where} block names ${blocks.group} "${blocks.option}", which the drink does not offer`)
    if (drink.choices[blocks.group]?.default === blocks.option) errors.push(`${where} block cannot block the default ${blocks.group} "${blocks.option}"`)
  }

  for (const milk of Object.keys(drink.colourByMilk ?? {})) {
    if (!allowed('milk').includes(milk)) errors.push(`${where} has a colour for milk "${milk}", which the drink does not offer`)
  }
  return errors
}

export function validateContent(raw: unknown): ValidationResult {
  const parsed = contentSchema.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, errors: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`) }
  }

  const content = parsed.data
  const errors: string[] = []
  const ingredientIds = new Set(content.ingredients.map((i) => i.id))
  const termIds = new Set(content.terms.map((t) => t.id))
  const drinkById = new Map(content.drinks.map((d) => [d.id, d]))
  const checkIngredient = (where: string, ingredientId: string) => {
    if (!ingredientIds.has(ingredientId)) errors.push(`${where} refers to unknown ingredient "${ingredientId}"`)
  }
  const checkTerm = (where: string, termId: string) => {
    if (!termIds.has(termId)) errors.push(`${where} refers to unknown term "${termId}"`)
  }

  for (const d of duplicates(content.ingredients.map((i) => i.id))) errors.push(`duplicate ingredient id "${d}"`)
  for (const d of duplicates(content.drinks.map((i) => i.id))) errors.push(`duplicate drink id "${d}"`)
  for (const d of duplicates(content.terms.map((t) => t.id))) errors.push(`duplicate term id "${d}"`)

  for (const ingredient of content.ingredients) {
    for (const s of ingredient.substitutes) checkIngredient(`ingredient "${ingredient.id}" substitute`, s)
    if (ingredient.termId) checkTerm(`ingredient "${ingredient.id}"`, ingredient.termId)
  }

  for (const group of CHOICE_GROUPS) {
    for (const option of OPTIONS[group]) {
      if (option.termId) checkTerm(`${group} option "${option.id}"`, option.termId)
    }
  }

  for (const drink of content.drinks) {
    if (RESERVED_DRINK_IDS.includes(drink.id)) errors.push(`drink id "${drink.id}" is reserved`)
    const groups: readonly string[] = ROOM_GROUPS[drink.room]
    if (!groups.includes(drink.group)) errors.push(`drink "${drink.id}" group "${drink.group}" is not a ${drink.room} group`)
    for (const line of drink.ingredients) checkIngredient(`drink "${drink.id}" ingredient`, line.ingredientId)
    drink.steps.forEach((step, n) => {
      for (const i of step.ingredientIds) checkIngredient(`drink "${drink.id}" step ${n + 1}`, i)
    })
    errors.push(...choiceErrors(drink))
  }

  for (const term of content.terms) {
    if (!term.example) continue
    const drink = drinkById.get(term.example.drinkId)
    if (!drink) {
      errors.push(`term "${term.id}" example refers to unknown drink "${term.example.drinkId}"`)
      continue
    }
    for (const [group, option] of Object.entries(term.example.choices)) {
      const offered = drink.choices[group as ChoiceGroup]?.options ?? []
      if (!offered.includes(option)) errors.push(`term "${term.id}" example uses ${group} "${option}", which "${drink.id}" does not offer`)
    }
  }

  return errors.length === 0 ? { ok: true, content } : { ok: false, errors }
}
