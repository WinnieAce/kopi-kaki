import { useContent } from '../content/ContentContext'
import type { Drink } from '../content/schema'
import { caffeineOf, LEVEL_NAMES } from '../core/caffeine'
import { resolveOrder } from '../core/order'
import { Cup } from './Cup'
import { CupLink } from './CupLink'

/** One drink on a room's menu: its usual cup, its name (and Chinese name), and its caffeine level in words. */
export function MenuRow({ drink }: { drink: Drink }) {
  const { ingredientById } = useContent()
  const order = resolveOrder(drink)
  const caffeine = caffeineOf(order.lines, ingredientById)
  return (
    <CupLink to={`/${drink.room}/${drink.id}`} className="menu-row">
      <Cup cup={order.cup} colour={order.colour} id={`menu:${drink.id}`} />
      {/* The Chinese name stays whole, dropping below the English one when space is tight. */}
      <span className="menu-text">
        <span className="menu-name">{drink.name}</span>
        {drink.chinese && (
          <span className="menu-zh" lang="zh-Hans">
            {drink.chinese}
          </span>
        )}
      </span>
      <span className={caffeine.level === 'none' ? 'menu-level none' : 'menu-level'}>{LEVEL_NAMES[caffeine.level]}</span>
    </CupLink>
  )
}
