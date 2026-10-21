import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Cup } from '../components/Cup'
import { CupLink } from '../components/CupLink'
import { Icon } from '../components/Icon'
import { useContent } from '../content/ContentContext'
import { choicesToSearch, resolveOrder } from '../core/order'
import { sameDrink, type SavedDrink } from '../storage/userData'
import { useUserData } from '../storage/UserDataContext'

const UNDO_MS = 5000

/** Saved café drinks and kopitiam orders. Removing one is immediate, with a few seconds to undo it. */
export function Saved() {
  const { drinkById } = useContent()
  const { data, removeSaved, restoreSaved } = useUserData()
  const [undo, setUndo] = useState<{ drink: SavedDrink; index: number; name: string } | null>(null)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const remove = (drink: SavedDrink, name: string) => {
    const index = removeSaved(drink)
    setUndo({ drink, index, name })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setUndo(null), UNDO_MS)
  }

  const rows = data.saved.flatMap((saved) => {
    const drink = drinkById.get(saved.drinkId)
    return drink ? [{ saved, order: resolveOrder(drink, saved.choices) }] : []
  })

  return (
    <div className="stack">
      <h1>Saved</h1>
      {rows.length === 0 ? (
        <div className="stack-sm">
          <p>Nothing saved yet.</p>
          <p className="muted">
            Build an order in the <Link to="/">Kopitiam room</Link> or open a drink in the <Link to="/cafe">Café room</Link>
            , then choose Save. Make a kopitiam order your usual and it waits for you at the top of the Kopitiam room.
          </p>
        </div>
      ) : (
        <ul className="plain-list saved-list" aria-label="Saved drinks">
          {rows.map(({ saved, order }) => {
            const search = choicesToSearch(order)
            const isUsual = data.usual !== null && sameDrink(data.usual, saved)
            return (
              <li key={`${saved.drinkId}?${search}`} className="saved-row">
                <CupLink to={`/${order.drink.room}/${order.drink.id}${search ? `?${search}` : ''}`} className="menu-row">
                  <Cup cup={order.cup} colour={order.colour} id={`saved:${saved.drinkId}?${search}`} />
                  <span className="menu-name">{order.name}</span>
                  {isUsual && <span className="usual-tag">Your usual</span>}
                </CupLink>
                <button className="remove" aria-label={`Remove ${order.name}`} onClick={() => remove(saved, order.name)}>
                  <Icon name="close" />
                </button>
              </li>
            )
          })}
        </ul>
      )}
      {/* Always present, so screen readers announce the removal when it happens. */}
      <div className="undo-bar" role="status">
        {undo && (
          <>
            <span>Removed {undo.name}.</span>
            <button
              className="button"
              onClick={() => {
                restoreSaved(undo.drink, undo.index)
                window.clearTimeout(timer.current)
                setUndo(null)
              }}
            >
              Undo
            </button>
          </>
        )}
      </div>
    </div>
  )
}
