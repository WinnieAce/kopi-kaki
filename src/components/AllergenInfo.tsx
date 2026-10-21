import type { Allergen } from '../content/schema'
import { ALLERGEN_LABEL_NOTE, NO_ALLERGENS } from '../core/allergens'

/** The allergens in this order, always with a reminder to check the label. */
export function AllergenInfo({ allergens }: { allergens: Allergen[] }) {
  return (
    <section className="stack-sm" aria-labelledby="allergen-heading">
      <h2 id="allergen-heading" className="label">
        Allergens
      </h2>
      <p>{allergens.length > 0 ? `Contains: ${allergens.join(', ')}` : NO_ALLERGENS}</p>
      <p className="small muted">{ALLERGEN_LABEL_NOTE}</p>
    </section>
  )
}
