// Moving between a list and a drink page with the browser's View Transitions: the tapped cup glides
// and grows into the big cup on the drink page, and glides back to the same spot on the way out. The
// big cup is always named `drink-cup` in the stylesheet; the matching small cup is named here, one
// at a time, because a name may only appear once on a page.

const NAME = 'drink-cup'

let settle: (() => void) | null = null
let lastCup: string | null = null

const cups = () => document.querySelectorAll<SVGElement>('svg.cup[data-cup]')

function nameOnly(cup: SVGElement | null) {
  for (const c of cups()) c.style.viewTransitionName = ''
  if (cup) cup.style.viewTransitionName = NAME
}

/** Remembers the cup inside a tapped link and names it, so it is the one that glides. */
export function rememberCup(link: Element) {
  const cup = link.querySelector<SVGElement>('svg.cup[data-cup]')
  lastCup = cup?.dataset.cup ?? null
  nameOnly(cup)
}

/**
 * Called once a new screen has rendered. Names the cup the person left from, if this screen has it,
 * then lets the waiting transition run.
 */
export function routeRendered() {
  if (lastCup) {
    const home = [...cups()].find((c) => c.dataset.cup === lastCup) ?? null
    if (home) nameOnly(home)
  }
  settle?.()
  settle = null
}

/**
 * Runs a navigation inside a view transition where the browser supports one. The old screen stays on
 * display until `routeRendered` reports the new one is ready. Anyone who has asked for less motion
 * gets an ordinary, instant change of screen, unless `fadeWhenReduced` asks for a plain cross-fade
 * (the stylesheet drops all movement from it), as when switching rooms.
 */
export function withViewTransition(go: () => void, { fadeWhenReduced = false } = {}) {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || (reduce && !fadeWhenReduced)) {
    go()
    return
  }
  document.startViewTransition(
    () =>
      new Promise<void>((resolve) => {
        settle = resolve
        go()
        // Never leave the screen frozen if the new one is slow or the navigation went nowhere.
        window.setTimeout(() => {
          if (settle === resolve) routeRendered()
        }, 600)
      }),
  )
}
