import { crossFade, rememberCup, routeRendered, withViewTransition } from './viewTransition'

afterEach(() => {
  vi.unstubAllGlobals()
  // @ts-expect-error -- removing the test double
  delete document.startViewTransition
  document.body.innerHTML = ''
})

it('navigates straight away where the browser has no view transitions', () => {
  const go = vi.fn()
  withViewTransition(go)
  expect(go).toHaveBeenCalledOnce()
})

it('navigates straight away, without a transition, for anyone who has asked for less motion', () => {
  const start = vi.fn()
  document.startViewTransition = start
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
  const go = vi.fn()
  withViewTransition(go)
  expect(go).toHaveBeenCalledOnce()
  expect(start).not.toHaveBeenCalled()
})

it('still cross-fades, without movement, for reduced motion when asked to', () => {
  const start = vi.fn()
  document.startViewTransition = start
  vi.stubGlobal('matchMedia', (query: string) => ({ matches: query.includes('reduce') }))
  withViewTransition(() => {}, { fadeWhenReduced: true })
  expect(start).toHaveBeenCalledOnce()
})

it('holds the old screen until the new one has rendered, then lets the transition run', async () => {
  let update: Promise<void> | undefined
  document.startViewTransition = ((callback: () => Promise<void>) => {
    update = callback()
    return { finished: update, updateCallbackDone: update, ready: update }
  }) as unknown as typeof document.startViewTransition
  let settled = false
  withViewTransition(() => {})
  update!.then(() => (settled = true))
  await Promise.resolve()
  expect(settled).toBe(false)
  routeRendered()
  await update
  expect(settled).toBe(true)
})

it('names the cup that was tapped, and only that one, so it can glide to the drink page', () => {
  document.body.innerHTML = `
    <a><svg class="cup" data-cup="shelf:kopi"></svg></a>
    <a><svg class="cup" data-cup="menu:kopi"></svg></a>`
  const [shelfCup, menuCup] = document.querySelectorAll<SVGElement>('.cup')
  menuCup.style.viewTransitionName = 'drink-cup'
  rememberCup(shelfCup.closest('a')!)
  expect(shelfCup.style.viewTransitionName).toBe('drink-cup')
  expect(menuCup.style.viewTransitionName).toBe('')
})

it('names the same cup again on the way back, so the drink glides home to where it came from', () => {
  document.body.innerHTML = '<a><svg class="cup" data-cup="shelf:kopi"></svg></a>'
  rememberCup(document.querySelector('a')!)
  document.body.innerHTML = `
    <a><svg class="cup" data-cup="menu:kopi"></svg></a>
    <a><svg class="cup" data-cup="shelf:kopi"></svg></a>`
  routeRendered()
  const [menuCup, shelfCup] = document.querySelectorAll<SVGElement>('.cup')
  expect(shelfCup.style.viewTransitionName).toBe('drink-cup')
  expect(menuCup.style.viewTransitionName).toBe('')
})

it('cross-fades a change made outside navigation, such as the theme', () => {
  const update = vi.fn()
  let inside = false
  document.startViewTransition = ((callback: () => void) => {
    inside = true
    callback()
    inside = false
    return {}
  }) as unknown as typeof document.startViewTransition
  crossFade(() => {
    update(inside)
  })
  expect(update).toHaveBeenCalledWith(true)
})

it('just makes the change where there are no view transitions', () => {
  const update = vi.fn()
  crossFade(update)
  expect(update).toHaveBeenCalledOnce()
})
