// The ordering choices a kopitiam drink can offer, defined once. A drink allows a subset of each group.
// The order of CHOICE_GROUPS is also the order of the words in an order's name: Kopi O Gau Kosong Peng.

export const CHOICE_GROUPS = ['milk', 'strength', 'sugar', 'temp'] as const
export type ChoiceGroup = (typeof CHOICE_GROUPS)[number]

export type ChoiceOption = {
  id: string
  /** Shown on the choice control. */
  label: string
  /** Added to the order's name; empty adds nothing. */
  word: string
  /** Plain words for the meaning line; empty adds nothing. */
  meaning: string
  /** Its entry in Kopitiam words. */
  termId?: string
}

const option = (id: string, label: string, word: string, meaning: string, termId?: string): ChoiceOption => ({
  id,
  label,
  word,
  meaning,
  ...(termId ? { termId } : {}),
})

export const OPTIONS: Record<ChoiceGroup, readonly ChoiceOption[]> = {
  milk: [
    option('condensed', 'Condensed', '', 'condensed milk', 'condensed-milk'),
    option('o', 'O', 'O', 'no milk', 'o'),
    option('c', 'C', 'C', 'evaporated milk', 'c'),
    option('milk', 'Milk', '', 'with milk'),
  ],
  strength: [
    option('po', 'Po', 'Po', 'weaker', 'po'),
    option('normal', 'Normal', '', ''),
    option('gau', 'Gau', 'Gau', 'stronger', 'gau'),
    option('di-lo', 'Di Lo', 'Di Lo', 'undiluted', 'di-lo'),
  ],
  sugar: [
    option('kosong', 'Kosong', 'Kosong', 'no sugar', 'kosong'),
    option('siew-dai', 'Siew Dai', 'Siew Dai', 'less sweet', 'siew-dai'),
    option('normal', 'Normal', '', ''),
    option('ga-dai', 'Ga Dai', 'Ga Dai', 'sweeter', 'ga-dai'),
  ],
  temp: [option('hot', 'Hot', '', 'hot'), option('peng', 'Peng', 'Peng', 'iced', 'peng')],
}

export const GROUP_LABELS: Record<ChoiceGroup, string> = {
  milk: 'Milk',
  strength: 'Strength',
  sugar: 'Sugar',
  temp: 'Temp',
}

/** How much a line with each role is multiplied by, for each option of the group that acts on it. */
export const FACTORS = {
  sweet: { kosong: 0, 'siew-dai': 0.5, normal: 1, 'ga-dai': 1.5 },
  strong: { po: 0.75, normal: 1, gau: 1.4, 'di-lo': 1 },
  dilute: { po: 1.3, normal: 1, gau: 1, 'di-lo': 0 },
} as const satisfies Record<'sweet' | 'strong' | 'dilute', Record<string, number>>

export function findOption(group: ChoiceGroup, id: string): ChoiceOption | undefined {
  return OPTIONS[group].find((o) => o.id === id)
}
