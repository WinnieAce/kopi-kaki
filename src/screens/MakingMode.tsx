import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Measure } from '../components/Measure'
import { useContent } from '../content/ContentContext'
import type { Caution, Room, Technique } from '../content/schema'
import { CUP_NAMES } from '../core/labels'
import { clampServings, MAX_SERVINGS, MIN_SERVINGS } from '../core/measures'
import { choicesFromSearch, choicesToSearch, resolveOrder } from '../core/order'
import { swipeDirection } from '../core/swipe'
import { useWakeLock } from '../hooks/useWakeLock'
import { NotFound } from './NotFound'

export const CAUTION_TEXT: Record<Caution, string> = {
  hot: 'Hot: take care. Younger cooks, ask an adult to help.',
  sharp: 'Ask an adult to help with the knife.',
}

export const TECHNIQUES: Record<Technique, { what: string; why: string; noTool: string }> = {
  brew: {
    what: 'Pour the just-boiled water slowly through the grounds or leaves and let it drip through.',
    why: 'Pouring slowly gives the water time to draw out the flavour; rushing makes a thin, sour brew.',
    noTool: 'No kopi sock? Line a sieve with a paper towel, or use a coffee bag.',
  },
  steep: {
    what: 'Leave the leaves or tea bag in the hot water for the time given, then take them out.',
    why: 'Steeping too long draws out bitterness; too short leaves the drink weak.',
    noTool: 'No teapot? A mug with a saucer on top keeps the heat in.',
  },
  stir: {
    what: 'Stir until everything has dissolved and the colour is even.',
    why: 'Sugar and condensed milk sink to the bottom; stirring spreads the sweetness through the cup.',
    noTool: 'No long spoon? A chopstick works.',
  },
  froth: {
    what: 'Heat the milk until hot but not boiling, then froth it until it looks glossy.',
    why: 'Air makes milk feel light and taste sweeter; boiling it makes it taste cooked.',
    // Never shake anything hot in a closed jar: it builds pressure and can spray out.
    noTool: 'No frother? Shake cold milk in a closed jar until foamy, then take the lid off and warm it in short bursts.',
  },
  whisk: {
    what: 'Whisk briskly in a zigzag until there are no lumps and a fine foam forms.',
    why: 'Matcha powder does not dissolve; whisking keeps it evenly spread through the water.',
    noTool: 'No bamboo whisk? A small whisk or a fork works; whisk in a wide cup so nothing splashes.',
  },
  pull: {
    what: 'Pour from one mug into another, from a little height, back and forth a few times.',
    why: 'Pulling cools the tea a little and froths it, which gives teh tarik its smooth top.',
    noTool: 'Practise with cool water first, and keep the pour low until you are steady.',
  },
  shake: {
    what: 'Close the lid tightly and shake hard for about 15 seconds.',
    why: 'Shaking chills the drink quickly and gives it a light foam.',
    noTool: 'No shaker? A jam jar with a tight lid works.',
  },
}

// Steps sit side by side: the next one arrives from the right and the last one leaves to the left,
// and going back reverses both, so the path out is the path in. Critically damped springs, so a
// step lands without bouncing; the exit is quicker than the entrance.
const pages: Variants = {
  enter: (direction: number) => ({ x: direction >= 0 ? '45%' : '-45%', opacity: 0 }),
  shown: { x: 0, opacity: 1, transition: { type: 'spring', bounce: 0, duration: 0.42 } },
  leave: (direction: number) => ({
    x: direction >= 0 ? '-35%' : '35%',
    opacity: 0,
    transition: { type: 'spring', bounce: 0, duration: 0.3 },
  }),
}

/** Step-by-step making of one order, read at arm's length with the screen kept awake. */
export function MakingMode({ room }: { room: Room }) {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { drinkById, ingredientById } = useContent()
  const [servings, setServings] = useState(MIN_SERVINGS)
  // Screen 0 is "gather everything"; screens 1..n are the steps. The direction of the last move
  // decides which side the next screen slides in from.
  const [[screen, direction], setPage] = useState<[number, number]>([0, 1])
  const show = (next: number) => setPage([next, next > screen ? 1 : -1])
  const found = drinkById.get(id ?? '')
  const drink = found?.room === room ? found : undefined
  useWakeLock(drink !== undefined)

  if (!drink) {
    return (
      <main className="making">
        <NotFound what="drink" />
      </main>
    )
  }

  const order = resolveOrder(drink, choicesFromSearch(params))
  const search = choicesToSearch(order)
  const drinkPage = `/${room}/${drink.id}${search ? `?${search}` : ''}`
  const step = screen === 0 ? null : order.steps[screen - 1]
  const isLast = screen === order.steps.length
  const technique = step?.technique ? TECHNIQUES[step.technique] : null
  const shown = step ? order.lines.filter((l) => step.ingredientIds.includes(l.ingredientId)) : order.lines

  // Leaving goes back to wherever the person came from, so Back on that screen does not loop into
  // making mode again. Opened directly, it replaces itself with the drink page.
  const leave = () => (location.key !== 'default' ? navigate(-1) : navigate(drinkPage, { replace: true }))
  const forward = () => (isLast ? leave() : show(screen + 1))
  const backward = () => screen > 0 && show(screen - 1)

  return (
    <main className="making">
      <header className="making-top">
        <button className="back" onClick={leave}>
          <Icon name="close" />
          Close
        </button>
        <h1>{order.name}</h1>
        <div className="stepper">
          <button
            className="button"
            aria-label="Fewer servings"
            disabled={servings <= MIN_SERVINGS}
            onClick={() => setServings(clampServings(servings - 1))}
          >
            −
          </button>
          <output aria-live="polite">{servings === 1 ? '1 serving' : `${servings} servings`}</output>
          <button
            className="button"
            aria-label="More servings"
            disabled={servings >= MAX_SERVINGS}
            onClick={() => setServings(clampServings(servings + 1))}
          >
            +
          </button>
        </div>
      </header>

      <section className="making-body" aria-live="polite">
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div
            key={screen}
            className="making-page"
            custom={direction}
            variants={pages}
            initial="enter"
            animate="shown"
            exit="leave"
            // The step follows the finger sideways. Where there is no step to go to, it gives a
            // little and springs back, rather than stopping dead.
            drag="x"
            dragDirectionLock
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: isLast ? 0.2 : 0.9, right: screen === 0 ? 0.2 : 0.9 }}
            dragTransition={{ bounceStiffness: 500, bounceDamping: 45 }}
            onDragEnd={(event, info) => {
              const width = (event.currentTarget as HTMLElement | null)?.offsetWidth || window.innerWidth
              const swipe = swipeDirection(info.offset.x, info.velocity.x, width)
              if (swipe === 'next' && !isLast) forward()
              if (swipe === 'back') backward()
            }}
          >
            {step ? (
              <>
                <p className="muted small">
                  Step {screen} of {order.steps.length}
                </p>
                <p className="making-step">{step.text}</p>
                {step.caution && (
                  <p className="caution" role="note">
                    <Icon name={step.caution} />
                    {CAUTION_TEXT[step.caution]}
                  </p>
                )}
              </>
            ) : (
              <>
                <h2>Gather everything</h2>
                <p>
                  <strong>Serve in:</strong> {CUP_NAMES[order.cup]}
                </p>
              </>
            )}

            {shown.length > 0 && (
              <ul className="plain-list ingredient-rows" aria-label="Ingredients">
                {shown.map((line) => {
                  const ingredient = ingredientById.get(line.ingredientId)!
                  return (
                    <li key={line.ingredientId}>
                      <Measure amount={line.amount} unit={ingredient.unit} servings={servings} />
                      <span>
                        {ingredient.name}
                        {line.optional && ' (optional)'}
                        {line.note && <span className="muted small"> · {line.note}</span>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}

            {!step && drink.tools.length > 0 && (
              <div className="stack-sm">
                <h3 id="making-tools">You'll need</h3>
                <ul className="plain-list stack-sm" aria-labelledby="making-tools">
                  {drink.tools.map((tool) => (
                    <li key={tool.name}>
                      {tool.name} <span className="muted">· or {tool.alternative}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {technique && (
              <aside className="technique" role="note">
                <p>{technique.what}</p>
                <p className="muted">Why: {technique.why}</p>
                <p className="muted">{technique.noTool}</p>
              </aside>
            )}
          </motion.div>
        </AnimatePresence>
      </section>

      <div className="making-actions">
        <button className="button" disabled={screen === 0} onClick={backward}>
          Back
        </button>
        <button className="button primary" onClick={forward}>
          {screen === 0 ? 'Start' : isLast ? 'Done' : 'Next'}
        </button>
      </div>
    </main>
  )
}
