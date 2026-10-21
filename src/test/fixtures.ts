import type { Content, Drink, Ingredient } from '../content/schema'

// A small, fixed set of content that every test uses. The numbers are chosen so results are easy to
// work out by hand: 10 g of kopi powder at 10 mg a gram is 100 mg of caffeine, and so on.

const ingredient = (
  id: string,
  name: string,
  unit: Ingredient['unit'],
  category: Ingredient['category'],
  extra: Partial<Ingredient> = {},
): Ingredient => ({
  id,
  name,
  category,
  description: `${name}, for the tests.`,
  unit,
  caffeineMg: 0,
  allergens: [],
  substitutes: [],
  colour: '#808080',
  ...extra,
})

const caffeinated = (caffeineMg: number) => ({ caffeineMg, caffeineSource: 'Fixture value' })

const ingredients: Ingredient[] = [
  ingredient('kopi-powder', 'Kopi powder', 'g', 'coffee', { ...caffeinated(10), colour: '#3b2416' }),
  ingredient('tea-dust', 'Tea dust', 'g', 'tea', caffeinated(6)),
  ingredient('condensed-milk', 'Condensed milk', 'tbsp', 'milk', { allergens: ['dairy'], termId: 'condensed-milk' }),
  ingredient('evaporated-milk', 'Evaporated milk', 'tbsp', 'milk', { allergens: ['dairy'] }),
  ingredient('sugar', 'Sugar', 'tsp', 'staple'),
  ingredient('boiling-water', 'Boiling water', 'ml', 'staple'),
  ingredient('water', 'Water', 'ml', 'staple'),
  ingredient('ice', 'Ice', 'piece', 'staple'),
  ingredient('milo-powder', 'Milo powder', 'tbsp', 'malt-and-chocolate', { ...caffeinated(2), allergens: ['dairy', 'gluten'] }),
  ingredient('pearl-barley', 'Pearl barley', 'g', 'fresh', { allergens: ['gluten'] }),
  ingredient('espresso', 'Espresso', 'ml', 'coffee', caffeinated(2)),
  ingredient('milk', 'Milk', 'ml', 'milk', { allergens: ['dairy'] }),
]

const allSugar = { options: ['kosong', 'siew-dai', 'normal', 'ga-dai'], default: 'normal' }
const sock = { name: 'Kopi sock', alternative: 'A fine sieve lined with a paper towel' }

const drinks: Drink[] = [
  {
    id: 'kopi',
    name: 'Kopi',
    chinese: '咖啡',
    room: 'kopitiam',
    group: 'kopi',
    meaning: 'Coffee',
    cup: 'kopitiam-cup',
    colour: '#c69a6c',
    colourByMilk: { o: '#3b2416', c: '#b9875f' },
    difficulty: 'easy',
    choices: {
      milk: { options: ['condensed', 'o', 'c'], default: 'condensed' },
      strength: { options: ['po', 'normal', 'gau', 'di-lo'], default: 'normal' },
      sugar: allSugar,
      temp: { options: ['hot', 'peng'], default: 'hot' },
    },
    blocked: [
      {
        chosen: { group: 'milk', option: 'condensed' },
        blocks: { group: 'sugar', option: 'kosong' },
        reason: 'Condensed milk is already sweet, so it can’t be Kosong. For no sugar, choose O or C.',
      },
    ],
    ingredients: [
      { ingredientId: 'kopi-powder', amount: 10, optional: false, role: 'strong' },
      { ingredientId: 'boiling-water', amount: 100, optional: false, note: 'just off the boil' },
      { ingredientId: 'condensed-milk', amount: 2, optional: false, role: 'sweet', when: { milk: ['condensed'] } },
      { ingredientId: 'evaporated-milk', amount: 1, optional: false, when: { milk: ['c'] } },
      { ingredientId: 'sugar', amount: 2, optional: false, role: 'sweet', when: { milk: ['o', 'c'] } },
      { ingredientId: 'water', amount: 60, optional: false, role: 'dilute' },
      { ingredientId: 'ice', amount: 6, optional: false, when: { temp: ['peng'] } },
    ],
    steps: [
      {
        text: 'Put the kopi powder in the sock and pour the boiling water through it into a jug.',
        technique: 'brew',
        ingredientIds: ['kopi-powder', 'boiling-water'],
        caution: 'hot',
      },
      { text: 'Spoon the condensed milk into the cup.', ingredientIds: ['condensed-milk'] },
      { text: 'Spoon the evaporated milk into the cup.', ingredientIds: ['evaporated-milk'] },
      { text: 'Add the sugar.', ingredientIds: ['sugar'] },
      { text: 'Pour the kopi into the cup.', ingredientIds: [], when: { temp: ['hot'] } },
      {
        text: 'Top up with the hot water and stir.',
        technique: 'stir',
        ingredientIds: ['water'],
        caution: 'hot',
        when: { temp: ['hot'] },
      },
      { text: 'Fill a glass with the ice and pour the kopi over it.', ingredientIds: ['ice'], when: { temp: ['peng'] } },
      { text: 'Top up with the cold water and stir.', technique: 'stir', ingredientIds: ['water'], when: { temp: ['peng'] } },
    ],
    tools: [sock],
    about: 'Robusta coffee brewed strong through a cloth sock, then sweetened. The test version of the real thing.',
  },
  {
    id: 'milo',
    name: 'Milo',
    chinese: '美禄',
    room: 'kopitiam',
    group: 'malt-and-chocolate',
    meaning: 'Malted chocolate',
    cup: 'kopitiam-cup',
    colour: '#8a5a3c',
    colourByMilk: { o: '#5a3a26' },
    difficulty: 'easy',
    choices: {
      milk: { options: ['milk', 'o'], default: 'milk' },
      strength: { options: ['normal', 'gau', 'di-lo'], default: 'normal' },
      sugar: allSugar,
      temp: { options: ['hot', 'peng'], default: 'hot' },
    },
    blocked: [
      {
        chosen: { group: 'milk', option: 'milk' },
        blocks: { group: 'sugar', option: 'kosong' },
        reason: 'Milo with milk is made with condensed milk, which is already sweet. For no added sugar, choose O.',
      },
    ],
    ingredients: [
      { ingredientId: 'milo-powder', amount: 3, optional: false, role: 'strong' },
      { ingredientId: 'condensed-milk', amount: 1, optional: false, role: 'sweet', when: { milk: ['milk'] } },
      { ingredientId: 'sugar', amount: 1, optional: false, role: 'sweet', when: { milk: ['o'] } },
      { ingredientId: 'boiling-water', amount: 60, optional: false },
      { ingredientId: 'water', amount: 120, optional: false, role: 'dilute' },
      { ingredientId: 'ice', amount: 6, optional: false, when: { temp: ['peng'] } },
    ],
    steps: [
      {
        text: 'Stir the Milo powder into the boiling water.',
        technique: 'stir',
        ingredientIds: ['milo-powder', 'boiling-water'],
        caution: 'hot',
      },
      { text: 'Stir in the condensed milk.', ingredientIds: ['condensed-milk'] },
      { text: 'Stir in the sugar.', ingredientIds: ['sugar'] },
      { text: 'Top up with the hot water and stir.', ingredientIds: ['water'], caution: 'hot', when: { temp: ['hot'] } },
      { text: 'Pour it over a glass of ice.', ingredientIds: ['ice'], when: { temp: ['peng'] } },
      { text: 'Top up with the cold water and stir.', ingredientIds: ['water'], when: { temp: ['peng'] } },
    ],
    tools: [{ name: 'Teaspoon', alternative: 'Any spoon' }],
    about: 'Malted chocolate powder stirred into hot water with milk. The test version of the real thing.',
  },
  {
    id: 'barley',
    name: 'Barley',
    chinese: '薏米水',
    room: 'kopitiam',
    group: 'cooling',
    meaning: 'Pearl barley water',
    cup: 'kopitiam-cup',
    colour: '#e6d8b8',
    difficulty: 'easy',
    choices: {
      strength: { options: ['normal', 'di-lo'], default: 'normal' },
      sugar: allSugar,
      temp: { options: ['hot', 'peng'], default: 'peng' },
    },
    blocked: [],
    ingredients: [
      { ingredientId: 'pearl-barley', amount: 20, optional: false },
      { ingredientId: 'boiling-water', amount: 400, optional: false },
      { ingredientId: 'sugar', amount: 3, optional: false, role: 'sweet' },
      { ingredientId: 'water', amount: 100, optional: false, role: 'dilute' },
      { ingredientId: 'ice', amount: 6, optional: false, when: { temp: ['peng'] } },
    ],
    steps: [
      {
        text: 'Simmer the pearl barley in the boiling water for 45 minutes, then strain.',
        technique: 'brew',
        ingredientIds: ['pearl-barley', 'boiling-water'],
        caution: 'hot',
      },
      { text: 'Stir in the sugar.', ingredientIds: ['sugar'] },
      { text: 'Stir in the water.', ingredientIds: ['water'] },
      { text: 'Pour it over a glass of ice.', ingredientIds: ['ice'], when: { temp: ['peng'] } },
    ],
    tools: [{ name: 'Saucepan', alternative: 'A rice cooker' }],
    about: 'Pearl barley simmered in water and lightly sweetened. The test version of the real thing.',
  },
  {
    id: 'flat-white',
    name: 'Flat White',
    room: 'cafe',
    group: 'coffee',
    meaning: 'Espresso with velvety milk',
    cup: 'cafe-cup',
    colour: '#b98a5c',
    difficulty: 'medium',
    choices: {},
    blocked: [],
    ingredients: [
      { ingredientId: 'espresso', amount: 60, optional: false },
      { ingredientId: 'milk', amount: 120, optional: false },
    ],
    steps: [
      { text: 'Make a double espresso into the cup.', technique: 'brew', ingredientIds: ['espresso'], caution: 'hot' },
      {
        text: 'Steam the milk until hot and silky, then pour it in.',
        technique: 'froth',
        ingredientIds: ['milk'],
        caution: 'hot',
      },
    ],
    tools: [{ name: 'Espresso machine', alternative: 'A moka pot, or 2 tsp strong instant coffee in 60 ml just-boiled water' }],
    about: 'A double espresso with a little velvety milk. The test version of the real thing.',
  },
  {
    id: 'babyccino',
    name: 'Babyccino',
    room: 'cafe',
    group: 'coffee',
    meaning: 'Frothed milk',
    cup: 'cafe-cup',
    colour: '#f3e6d4',
    difficulty: 'easy',
    choices: {},
    blocked: [],
    ingredients: [{ ingredientId: 'milk', amount: 120, optional: false }],
    steps: [
      {
        text: 'Froth the milk until warm, then pour it into the cup.',
        technique: 'froth',
        ingredientIds: ['milk'],
        caution: 'hot',
      },
    ],
    tools: [{ name: 'Milk frother', alternative: 'Shake cold milk in a closed jar, then warm it uncovered' }],
    about: 'Warm frothed milk in a café cup, with no coffee at all. The test version of the real thing.',
  },
]

const term = (id: string, word: string, extra: Partial<Content['terms'][number]> = {}) => ({
  id,
  word,
  also: [],
  meaning: `What ${word} means, for the tests.`,
  origin: `Where ${word} comes from, for the tests.`,
  ...extra,
})

const terms: Content['terms'] = [
  term('condensed-milk', 'Condensed milk'),
  term('o', 'O'),
  term('c', 'C'),
  term('kosong', 'Kosong'),
  term('siew-dai', 'Siew Dai'),
  term('ga-dai', 'Ga Dai'),
  term('gau', 'Gau'),
  term('po', 'Po'),
  term('di-lo', 'Di Lo'),
  term('peng', 'Peng', { also: ['Beng'], example: { drinkId: 'kopi', choices: { temp: 'peng' } } }),
]

export const fixtureContent: Content = { ingredients, drinks, terms }

export const fixtureById: ReadonlyMap<string, Ingredient> = new Map(ingredients.map((i) => [i.id, i]))

export function fixtureDrink(id: string): Drink {
  const drink = drinks.find((d) => d.id === id)
  if (!drink) throw new Error(`No fixture drink "${id}"`)
  return drink
}
