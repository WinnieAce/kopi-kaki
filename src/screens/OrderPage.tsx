import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { CaffeineInfo } from '../components/CaffeineInfo'
import { ChoiceRow } from '../components/ChoiceRow'
import { Cup } from '../components/Cup'
import { Icon } from '../components/Icon'
import { RecipeDetails } from '../components/RecipeDetails'
import { CHOICE_GROUPS, GROUP_LABELS, OPTIONS, findOption, type ChoiceGroup } from '../content/choices'
import { useContent } from '../content/ContentContext'
import type { CupId, Drink } from '../content/schema'
import { caffeineOf } from '../core/caffeine'
import { cupExtras } from '../core/cupExtras'
import {
  choicesFromSearch,
  choicesToSearch,
  isBlocked,
  normaliseChoices,
  resolveOrder,
  type Choices,
  type ResolvedOrder,
} from '../core/order'
import { restLoops } from '../hooks/loopRest'
import { sameDrink, type SavedDrink } from '../storage/userData'
import { useUserData } from '../storage/UserDataContext'
import { NotFound } from './NotFound'

type Fallback = { group: ChoiceGroup; text: string } | null

/** Which choice the resolver moved back, and why, so the row it happened in can say so. */
function fallbackOf(requested: Choices, order: ResolvedOrder): Fallback {
  const group = CHOICE_GROUPS.find((g) => requested[g] !== undefined && requested[g] !== order.choices[g])
  if (!group || order.notes.length === 0) return null
  const back = findOption(group, order.choices[group]!)!.label
  return { group, text: `${order.notes[0]} ${GROUP_LABELS[group]} is back to ${back}.` }
}

/** The cups this drink can be served in: its own, and the Peng glass if it can be iced. */
const cupsFor = (drink: Drink): CupId[] => [
  ...new Set<CupId>([drink.cup, ...(drink.choices.temp?.options.includes('peng') ? (['peng-glass'] as const) : [])]),
]

function Builder({ drink }: { drink: Drink }) {
  const { ingredientById } = useContent()
  const { data, toggleSaved, setUsual } = useUserData()
  const [params, setParams] = useSearchParams()
  const requested = choicesFromSearch(params)
  const order = resolveOrder(drink, requested)
  // A blocked pair in the address on arrival is explained too.
  const [fallback, setFallback] = useState<Fallback>(() => fallbackOf(requested as Choices, order))

  const choose = (group: ChoiceGroup, option: string) => {
    const wanted = { ...order.choices, [group]: option }
    const next = resolveOrder(drink, wanted)
    setFallback(fallbackOf(wanted, next))
    setParams(choicesToSearch(next), { replace: true })
  }

  const saved: SavedDrink = { drinkId: drink.id, choices: normaliseChoices(order) as Record<string, string> }
  const isSaved = data.saved.some((s) => sameDrink(s, saved))
  const isUsual = data.usual !== null && sameDrink(data.usual, saved)
  const search = choicesToSearch(order)
  const caffeine = caffeineOf(order.lines, ingredientById)
  const words = CHOICE_GROUPS.flatMap((g) => {
    const option = order.choices[g] ? findOption(g, order.choices[g]) : undefined
    return option?.word ? [option] : []
  })

  return (
    <article className="order stack">
      <header className="order-hero" ref={restLoops}>
        <div className="vessel">
          {cupsFor(drink).map((cup) => (
            <div key={cup} className="vessel-cup" data-shown={cup === order.cup}>
              <Cup cup={cup} colour={order.colour} extras={cupExtras(order)} />
            </div>
          ))}
        </div>
        <h1>{order.name}</h1>
        {drink.chinese && (
          <p className="order-zh" lang="zh-Hans">
            {drink.chinese}
          </p>
        )}
        <p className="order-meaning">{order.meaning}</p>
      </header>

      <div className="choices">
        {CHOICE_GROUPS.map((group) => {
          const setting = drink.choices[group]
          if (!setting) return null
          return (
            <ChoiceRow
              key={group}
              group={group}
              options={OPTIONS[group].filter((o) => setting.options.includes(o.id))}
              value={order.choices[group]!}
              blockedReason={(id) => isBlocked(drink, order.choices, group, id)}
              onChange={(id) => choose(group, id)}
              note={fallback?.group === group ? fallback.text : null}
            />
          )
        })}
      </div>

      <CaffeineInfo
        caffeine={caffeine}
        suggestPo={(drink.choices.strength?.options.includes('po') ?? false) && order.choices.strength !== 'po'}
      />

      <div className="order-actions">
        <Link className="button primary" to={`/kopitiam/${drink.id}/make${search ? `?${search}` : ''}`}>
          Make this at home
        </Link>
        <div className="row">
          <button className="button" aria-pressed={isSaved} onClick={() => toggleSaved(saved)}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
          <button className="button" aria-pressed={isUsual} onClick={() => setUsual(isUsual ? null : saved)}>
            {isUsual && <Icon name="tick" />}
            {isUsual ? 'Your usual' : 'Make this my usual'}
          </button>
        </div>
      </div>

      <section className="stack-sm" aria-labelledby="words-heading">
        <h2 id="words-heading">What the words mean</h2>
        {words.length === 0 ? (
          <p>
            A plain {drink.name}: {order.meaning.toLowerCase()}. Add a word above to change it.
          </p>
        ) : (
          <dl className="words-used">
            {words.map((option) => (
              <div key={option.id}>
                <dt>{option.termId ? <Link to={`/words#${option.termId}`}>{option.word}</Link> : option.word}</dt>
                <dd>{option.meaning}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <RecipeDetails order={order} />
    </article>
  )
}

export function OrderPage() {
  const { id } = useParams()
  const { drinkById } = useContent()
  const drink = drinkById.get(id ?? '')
  if (!drink || drink.room !== 'kopitiam') return <NotFound what="drink" />
  // Keyed by drink, so moving between drinks starts with fresh notes.
  return <Builder key={drink.id} drink={drink} />
}
