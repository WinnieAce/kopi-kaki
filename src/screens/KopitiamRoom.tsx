import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Cup } from '../components/Cup'
import { CupLink } from '../components/CupLink'
import { Icon } from '../components/Icon'
import { SEAL_CHINESE, SIGNBOARD_CHINESE } from '../content/chineseUi'
import { useContent } from '../content/ContentContext'
import { KOPITIAM_GROUPS, type Drink } from '../content/schema'
import { caffeineOf, LEVEL_NAMES } from '../core/caffeine'
import { cupExtras } from '../core/cupExtras'
import { GROUP_CHIPS, GROUP_NAMES } from '../core/labels'
import { choicesToSearch, resolveOrder } from '../core/order'
import { filterDrinks } from '../core/search'
import { useUserData } from '../storage/UserDataContext'

const oneOf = <T extends string>(allowed: readonly T[], value: string | null): T | undefined =>
  allowed.find((a) => a === value)

function MenuRow({ drink }: { drink: Drink }) {
  const { ingredientById } = useContent()
  const order = resolveOrder(drink)
  const caffeine = caffeineOf(order.lines, ingredientById)
  return (
    <CupLink to={`/kopitiam/${drink.id}`} className="menu-row">
      <Cup cup={order.cup} colour={order.colour} id={`menu:${drink.id}`} />
      <span className="menu-name">{drink.name}</span>
      {drink.chinese && (
        <span className="menu-zh" lang="zh-Hans">
          {drink.chinese}
        </span>
      )}
      <span className={caffeine.level === 'none' ? 'menu-level none' : 'menu-level'}>{LEVEL_NAMES[caffeine.level]}</span>
    </CupLink>
  )
}

function Usual() {
  const { drinkById } = useContent()
  const { data } = useUserData()
  const drink = data.usual && drinkById.get(data.usual.drinkId)
  if (!data.usual || !drink) return null
  const order = resolveOrder(drink, data.usual.choices)
  const search = choicesToSearch(order)
  return (
    <section className="usual" aria-labelledby="usual-heading">
      <Cup cup={order.cup} colour={order.colour} extras={cupExtras(order)} />
      <div>
        <h2 id="usual-heading" className="label">
          Your usual
        </h2>
        <p className="usual-name">{order.name}</p>
      </div>
      <Link className="usual-make" to={`/kopitiam/${drink.id}/make${search ? `?${search}` : ''}`}>
        Make it
      </Link>
    </section>
  )
}

export function KopitiamRoom() {
  const { content, ingredientById } = useContent()
  const [params, setParams] = useSearchParams()
  // The text box keeps its own value: the address updates a moment later, and driving a text input
  // from it can move the caret or drop characters while typing.
  const [query, setQuery] = useState(params.get('q') ?? '')
  const group = oneOf(KOPITIAM_GROUPS, params.get('group'))
  const noCaffeine = params.get('nocaf') === '1'

  const drinks = useMemo(
    () => filterDrinks(content, { room: 'kopitiam', query, group, noCaffeine }, ingredientById),
    [content, query, group, noCaffeine, ingredientById],
  )

  // Filters live in the address so Back returns to the same list.
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
      <header className="signboard">
        <h1>Kopitiam</h1>
        <p className="signboard-zh" lang="zh-Hans" aria-hidden="true">
          {SIGNBOARD_CHINESE}
        </p>
        <span className="seal" lang="zh-Hans" aria-hidden="true">
          {SEAL_CHINESE}
        </span>
      </header>
      <div className="mosaic" aria-hidden="true" />

      <Usual />

      <label className="field search">
        <span className="visually-hidden">Search drinks or words</span>
        <Icon name="search" />
        <input
          type="search"
          placeholder="Search drinks or words"
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
        {KOPITIAM_GROUPS.map((g) => (
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
        {KOPITIAM_GROUPS.map((g) => {
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

      <p>
        <Link to="/words">What do the words mean? Kopitiam words</Link>
      </p>
    </div>
  )
}
