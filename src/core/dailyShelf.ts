import { ROOM_GROUPS, type Content, type Drink, type Room } from '../content/schema'

const DAY_MS = 24 * 60 * 60 * 1000

/** Which calendar day `date` falls on, counted in the person's own time zone, so a day starts at their midnight. */
export function dayNumber(date: Date): number {
  return Math.floor((date.getTime() - date.getTimezoneOffset() * 60 * 1000) / DAY_MS)
}

/**
 * The day's picks for a room: up to `perGroup` easy drinks from each group, taking turns between groups.
 * Each day moves every group on by one drink, so the shelf changes daily but stays the same all day and
 * on every phone. Groups start at different points so they don't all change in step.
 */
export function dailyStarters(content: Content, room: Room, date: Date, perGroup: number): Drink[] {
  const day = dayNumber(date)
  const byGroup = ROOM_GROUPS[room].map((group, n) => {
    const easy = content.drinks
      .filter((d) => d.room === room && d.group === group && d.difficulty === 'easy')
      .sort((a, b) => a.id.localeCompare(b.id))
    const start = easy.length > 0 ? (day + n * 3) % easy.length : 0
    return Array.from({ length: Math.min(perGroup, easy.length) }, (_, k) => easy[(start + k) % easy.length])
  })
  return Array.from({ length: perGroup }, (_, round) => byGroup.flatMap((picks) => (picks[round] ? [picks[round]] : []))).flat()
}
