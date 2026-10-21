import { z } from 'zod'
import { CHOICE_GROUPS } from './choices'

const id = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, 'must be lowercase letters and digits joined by hyphens')
const text = z.string().trim().min(1)
const colour = z.string().regex(/^#[0-9a-f]{6}$/, 'must be a colour such as #2b6655')

export const ROOMS = ['kopitiam', 'cafe'] as const
export const KOPITIAM_GROUPS = ['kopi', 'teh', 'malt-and-chocolate', 'cooling'] as const
export const CAFE_GROUPS = ['coffee', 'tea-and-matcha'] as const
export const ROOM_GROUPS = { kopitiam: KOPITIAM_GROUPS, cafe: CAFE_GROUPS } as const
export const CUPS = ['kopitiam-cup', 'peng-glass', 'cafe-cup', 'tall-glass', 'mug'] as const
export const UNITS = ['ml', 'g', 'tsp', 'tbsp', 'piece'] as const
export const ALLERGENS = ['dairy', 'soy', 'gluten', 'nuts'] as const
export const INGREDIENT_CATEGORIES = [
  'coffee',
  'tea',
  'malt-and-chocolate',
  'milk',
  'sweetener',
  'flavour',
  'fresh',
  'staple',
] as const
export const ROLES = ['sweet', 'strong', 'dilute'] as const
export const TECHNIQUES = ['brew', 'steep', 'stir', 'froth', 'whisk', 'pull', 'shake'] as const
export const CAUTIONS = ['hot', 'sharp'] as const
export const DIFFICULTIES = ['easy', 'medium', 'harder'] as const

const choiceGroup = z.enum(CHOICE_GROUPS)
const when = z.partialRecord(choiceGroup, z.array(id).min(1))

export const ingredientSchema = z
  .strictObject({
    id,
    name: text,
    category: z.enum(INGREDIENT_CATEGORIES),
    description: text,
    /** Every use of the ingredient is measured in this unit. */
    unit: z.enum(UNITS),
    /** Milligrams of caffeine per one unit, as it ends up in the cup. */
    caffeineMg: z.number().min(0),
    caffeineSource: text.optional(),
    allergens: z.array(z.enum(ALLERGENS)),
    substitutes: z.array(id),
    colour,
    termId: id.optional(),
  })
  .refine((i) => i.caffeineMg === 0 || i.caffeineSource !== undefined, {
    message: 'an ingredient with caffeine needs a caffeineSource',
    path: ['caffeineSource'],
  })

const drinkIngredientSchema = z.strictObject({
  ingredientId: id,
  amount: z.number().positive(),
  optional: z.boolean(),
  note: text.optional(),
  role: z.enum(ROLES).optional(),
  when: when.optional(),
})

const stepSchema = z.strictObject({
  text,
  technique: z.enum(TECHNIQUES).optional(),
  ingredientIds: z.array(id),
  caution: z.enum(CAUTIONS).optional(),
  when: when.optional(),
})

const pick = z.strictObject({ group: choiceGroup, option: id })

export const drinkSchema = z.strictObject({
  id,
  name: text,
  chinese: text.optional(),
  room: z.enum(ROOMS),
  group: z.enum([...KOPITIAM_GROUPS, ...CAFE_GROUPS]),
  /** A few words for the builder's meaning line, such as "Coffee". */
  meaning: text,
  cup: z.enum(CUPS),
  colour,
  colourByMilk: z.record(id, colour).optional(),
  difficulty: z.enum(DIFFICULTIES),
  choices: z.partialRecord(choiceGroup, z.strictObject({ options: z.array(id), default: id })),
  blocked: z.array(z.strictObject({ chosen: pick, blocks: pick, reason: text })),
  ingredients: z.array(drinkIngredientSchema).min(1),
  steps: z.array(stepSchema).min(1),
  tools: z.array(z.strictObject({ name: text, alternative: text })),
  about: text,
})

export const termSchema = z.strictObject({
  id,
  word: text,
  also: z.array(text),
  meaning: text,
  origin: text,
  example: z.strictObject({ drinkId: id, choices: z.record(z.string(), id) }).optional(),
})

export const contentSchema = z.strictObject({
  ingredients: z.array(ingredientSchema),
  drinks: z.array(drinkSchema),
  terms: z.array(termSchema),
})

export type Room = (typeof ROOMS)[number]
export type DrinkGroup = (typeof KOPITIAM_GROUPS)[number] | (typeof CAFE_GROUPS)[number]
export type CupId = (typeof CUPS)[number]
export type Unit = (typeof UNITS)[number]
export type Allergen = (typeof ALLERGENS)[number]
export type IngredientCategory = (typeof INGREDIENT_CATEGORIES)[number]
export type Role = (typeof ROLES)[number]
export type Technique = (typeof TECHNIQUES)[number]
export type Caution = (typeof CAUTIONS)[number]
export type Difficulty = (typeof DIFFICULTIES)[number]
export type When = z.infer<typeof when>
export type Ingredient = z.infer<typeof ingredientSchema>
export type DrinkIngredient = z.infer<typeof drinkIngredientSchema>
export type Step = z.infer<typeof stepSchema>
export type Block = Drink['blocked'][number]
export type Drink = z.infer<typeof drinkSchema>
export type Term = z.infer<typeof termSchema>
export type Content = z.infer<typeof contentSchema>
