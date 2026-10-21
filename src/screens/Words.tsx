import { useLayoutEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useContent } from '../content/ContentContext'
import type { Term } from '../content/schema'
import { choicesToSearch, resolveOrder } from '../core/order'

function Example({ example }: { example: NonNullable<Term['example']> }) {
  const { drinkById } = useContent()
  const drink = drinkById.get(example.drinkId)
  if (!drink) return null
  const order = resolveOrder(drink, example.choices)
  const search = choicesToSearch(order)
  return (
    <p>
      <span className="muted">For example: </span>
      <Link to={`/kopitiam/${drink.id}${search ? `?${search}` : ''}`}>{order.name}</Link>
    </p>
  )
}

/** Every kopitiam ordering word, what it means and where it comes from, each with an order to try. */
export function Words() {
  const { content } = useContent()
  const { hash } = useLocation()

  // A link such as /words#peng opens at that word.
  useLayoutEffect(() => {
    if (hash) document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ block: 'start' })
  }, [hash])

  return (
    <div className="stack">
      <header className="stack-sm">
        <h1>Kopitiam words</h1>
        <p className="muted">
          A kopitiam order is a drink and a few words that change it. Here is what each word means and where it comes
          from.
        </p>
      </header>
      <div className="words">
        {content.terms.map((term) => (
          <section key={term.id} id={term.id} className="word stack-sm" aria-labelledby={`word-${term.id}`}>
            <h2 id={`word-${term.id}`}>{term.word}</h2>
            {term.also.length > 0 && <p className="small muted">Also: {term.also.join(', ')}</p>}
            <p>{term.meaning}</p>
            <p className="small muted">{term.origin}</p>
            {term.example && <Example example={term.example} />}
          </section>
        ))}
      </div>
    </div>
  )
}
