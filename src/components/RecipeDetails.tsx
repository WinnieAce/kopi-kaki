import { useContent } from '../content/ContentContext'
import { orderAllergens } from '../core/allergens'
import type { ResolvedOrder } from '../core/order'
import { AllergenInfo } from './AllergenInfo'
import { Measure } from './Measure'

/** The part of a drink page both rooms share: ingredients for this order, tools, allergens and the story. */
export function RecipeDetails({ order }: { order: ResolvedOrder }) {
  const { ingredientById } = useContent()
  const { drink } = order
  return (
    <>
      <section className="stack-sm" aria-labelledby="ingredients-heading">
        <h2 id="ingredients-heading">Ingredients</h2>
        <ul className="plain-list ingredient-rows" aria-label="Ingredients">
          {order.lines.map((line) => {
            const ingredient = ingredientById.get(line.ingredientId)!
            return (
              <li key={line.ingredientId}>
                <Measure amount={line.amount} unit={ingredient.unit} />
                <span>
                  {ingredient.name}
                  {line.optional && <span className="muted small"> (optional)</span>}
                  {line.note && <span className="muted small"> · {line.note}</span>}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      {drink.tools.length > 0 && (
        <section className="stack-sm" aria-labelledby="tools-heading">
          <h2 id="tools-heading">You'll need</h2>
          <ul className="plain-list stack-sm">
            {drink.tools.map((tool) => (
              <li key={tool.name}>
                {tool.name}
                <span className="muted small"> · or {tool.alternative}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <AllergenInfo allergens={orderAllergens(order.lines, ingredientById)} />

      <section className="stack-sm" aria-labelledby="about-heading">
        <h2 id="about-heading">About {drink.name}</h2>
        <p className="prose">{drink.about}</p>
      </section>
    </>
  )
}
