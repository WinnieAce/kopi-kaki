import { useMemo, useState, type CSSProperties } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Cup } from '../components/Cup'
import { CupLink } from '../components/CupLink'
import { Icon } from '../components/Icon'
import { MenuRow } from '../components/MenuRow'
import { useContent } from '../content/ContentContext'
import { CAFE_GROUPS } from '../content/schema'
import { caffeineOf, LEVEL_NAMES } from '../core/caffeine'
import { cupExtras } from '../core/cupExtras'
import { dailyStarters } from '../core/dailyShelf'
import { GROUP_CHIPS, GROUP_NAMES, greeting } from '../core/labels'
import { resolveOrder } from '../core/order'
import { filterDrinks } from '../core/search'
import { shelfMotion } from '../hooks/shelfMotion'
import { useUserData } from '../storage/UserDataContext'

const SHELF_SIZE = 8

// The shelf's tiles rise in once per visit to the app, not every time the room is opened again.
let shelfHasEntered = false

const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  allowed.find((a) => a === value)

export function CafeRoom() {
  const { content, drinkById, ingredientById } = useContent()
  const { data } = useUserData()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const group = oneOf(CAFE_GROUPS, params.get('group'))
  const noCaffeine = params.get('nocaf') === '1'
  // Read once, when the room opens, so neither can change in the middle of a visit.
  const [hello] = useState(() => greeting(new Date().getHours()))
  const [starters] = useState(() => dailyStarters(content, 'cafe', new Date(), 3))
  const [entering] = useState(() => {
    const first = !shelfHasEntered
    shelfHasEntered = true
    return first
  })

  const drinks = useMemo(
    () => filterDrinks(content, { room: 'cafe', query, group, noCaffeine }, ingredientById),
    [content, query, group, noCaffeine, ingredientById],
  )

  // Saved café drinks first, then the day's picks.
  const savedCafe = data.saved.flatMap((s) => {
    const drink = drinkById.get(s.drinkId)
    return drink?.room === 'cafe' ? [drink] : []
  })
  const shelf = [...savedCafe, ...starters.filter((d) => !savedCafe.includes(d))].slice(0, SHELF_SIZE)

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next, { replace: true })
  }
  const clearAll = () => {
    setQuery('')
    setParams({}, { replace: true })
  }

  return (
    <div className="stack">
      {/* The heading names the room, so the page title and screen readers say where you are; the
          greeting sits above it, like a sign by the door. */}
      <header>
        <p className="hello">{hello}</p>
        <h1>Café</h1>
      </header>

      {shelf.length > 0 && (
        <section className="stack-sm" aria-labelledby="shelf-heading">
          <h2 id="shelf-heading" className="label">
            Today’s cups
          </h2>
          <ul className={entering ? 'shelf entering' : 'shelf'} aria-labelledby="shelf-heading" ref={shelfMotion}>
            {shelf.map((drink, n) => {
              const order = resolveOrder(drink)
              const level = caffeineOf(order.lines, ingredientById).level
              return (
                // --order staggers the tiles' entrance; --phase starts each cup's loops at a different point.
                <li key={drink.id} style={{ '--order': n, '--phase': `${-n * 0.37}s` } as CSSProperties}>
                  <CupLink to={`/cafe/${drink.id}`} className="tile">
                    <Cup cup={order.cup} colour={order.colour} extras={cupExtras(order)} id={`shelf:${drink.id}`} />
                    <span className="tile-name">{drink.name}</span>
                    <small>{LEVEL_NAMES[level]}</small>
                  </CupLink>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <label className="field search">
        <span className="visually-hidden">Search café drinks</span>
        <Icon name="search" />
        <input
          type="search"
          placeholder="Search café drinks"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setParam('q', e.target.value)
          }}
        />
      </label>

      <div className="chips" role="group" aria-label="Show">
        <button className="chip" aria-pressed={!group && !noCaffeine} onClick={clearAll}>
          All
        </button>
        {CAFE_GROUPS.map((g) => (
          <button key={g} className="chip" aria-pressed={group === g} onClick={() => setParam('group', group === g ? '' : g)}>
            {GROUP_CHIPS[g]}
          </button>
        ))}
        <button className="chip" aria-pressed={noCaffeine} onClick={() => setParam('nocaf', noCaffeine ? '' : '1')}>
          No caffeine
        </button>
      </div>

      <section className="menu" aria-label="Menu">
        <p className="visually-hidden" role="status">
          {drinks.length === 1 ? '1 drink' : `${drinks.length} drinks`}
        </p>
        {drinks.length === 0 && (
          <div className="stack-sm">
            <p>No drinks match. Try a different word or fewer filters.</p>
            <div>
              <button className="button" onClick={clearAll}>
                Clear filters
              </button>
            </div>
          </div>
        )}
        {CAFE_GROUPS.map((g) => {
          const inGroup = drinks.filter((d) => d.group === g)
          if (inGroup.length === 0) return null
          return (
            <div key={g} className="menu-group">
              <h2 className="label">{GROUP_NAMES[g]}</h2>
              <ul className="plain-list">
                {inGroup.map((drink) => (
                  <li key={drink.id}>
                    <MenuRow drink={drink} />
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </section>
    </div>
  )
}
