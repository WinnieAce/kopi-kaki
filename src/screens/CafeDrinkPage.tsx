import { Link, useParams } from 'react-router-dom'
import { CaffeineInfo } from '../components/CaffeineInfo'
import { Cup } from '../components/Cup'
import { RecipeDetails } from '../components/RecipeDetails'
import { useContent } from '../content/ContentContext'
import { caffeineOf } from '../core/caffeine'
import { cupExtras } from '../core/cupExtras'
import { resolveOrder } from '../core/order'
import { restLoops } from '../hooks/loopRest'
import { sameDrink } from '../storage/userData'
import { useUserData } from '../storage/UserDataContext'
import { NotFound } from './NotFound'

export function CafeDrinkPage() {
  const { id } = useParams()
  const { drinkById, ingredientById } = useContent()
  const { data, toggleSaved } = useUserData()
  const drink = drinkById.get(id ?? '')
  if (!drink || drink.room !== 'cafe') return <NotFound what="drink" />

  const order = resolveOrder(drink)
  const saved = { drinkId: drink.id, choices: {} }
  const isSaved = data.saved.some((s) => sameDrink(s, saved))

  return (
    <article className="stack">
      <header className="order-hero" ref={restLoops}>
        <div className="vessel">
          <div className="vessel-cup" data-shown="true">
            <Cup cup={order.cup} colour={order.colour} extras={cupExtras(order)} />
          </div>
        </div>
        <h1>{drink.name}</h1>
        <p className="order-meaning">{drink.meaning}</p>
      </header>

      <CaffeineInfo caffeine={caffeineOf(order.lines, ingredientById)} suggestPo={false} />

      <div className="order-actions">
        <Link className="button primary" to={`/cafe/${drink.id}/make`}>
          Make this at home
        </Link>
        <div className="row">
          <button className="button" aria-pressed={isSaved} onClick={() => toggleSaved(saved)}>
            {isSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <RecipeDetails order={order} />
    </article>
  )
}
