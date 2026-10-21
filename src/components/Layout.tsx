import { motion } from 'motion/react'
import type { MouseEvent } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { withViewTransition } from '../hooks/viewTransition'
import { useUserData } from '../storage/UserDataContext'
import { roomForPath } from '../theme/applyTheme'
import { Icon } from './Icon'

const TABS = [
  { to: '/', label: 'Kopitiam' },
  { to: '/cafe', label: 'Café' },
  { to: '/saved', label: 'Saved' },
  { to: '/settings', label: 'Settings' },
] as const

/** Which tab a page belongs to, so inner pages keep their room's tab lit. */
function tabFor(pathname: string): string | null {
  if (pathname === '/saved') return '/saved'
  if (pathname === '/settings' || pathname === '/terms') return '/settings'
  if (pathname === '/cafe' || pathname.startsWith('/cafe/')) return '/cafe'
  if (roomForPath(pathname) === 'kopitiam') return '/'
  return null
}

/** Where Back goes when a page was opened directly and there is nothing to go back to. */
function homeFor(pathname: string): string {
  if (pathname === '/terms') return '/settings'
  return roomForPath(pathname) === 'kopitiam' ? '/' : '/cafe'
}

export function Layout() {
  const { persistent } = useUserData()
  const location = useLocation()
  const navigate = useNavigate()
  const current = tabFor(location.pathname)
  const isMainScreen = TABS.some((t) => t.to === location.pathname)

  // An installed app has no browser back button, so inner pages have their own.
  const goBack = () =>
    withViewTransition(() => (location.key === 'default' ? navigate(homeFor(location.pathname)) : navigate(-1)))

  // Moving between tabs cross-fades the screens, drifting a little towards the tab that was tapped.
  const switchTab = (event: MouseEvent<HTMLAnchorElement>, to: string) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
      return
    event.preventDefault()
    const from = TABS.findIndex((t) => t.to === current)
    const next = TABS.findIndex((t) => t.to === to)
    const root = document.documentElement
    root.dataset.navDirection = next < from ? 'left' : 'right'
    withViewTransition(() => navigate(to), { fadeWhenReduced: true })
    // Only tab switches drift; other screen changes plainly cross-fade.
    window.setTimeout(() => delete root.dataset.navDirection, 400)
  }

  return (
    <div className="app">
      {!isMainScreen && (
        <header className="header">
          <button className="back" onClick={goBack}>
            <Icon name="back" />
            Back
          </button>
        </header>
      )}
      {!persistent && (
        <p className="notice" role="status">
          Changes won't be saved in this browser session. Private browsing or a full device can cause this.
        </p>
      )}
      <main className="main">
        <Outlet />
      </main>
      <nav className="nav" aria-label="Main">
        {TABS.map((tab) => {
          const active = tab.to === current
          return (
            <Link
              key={tab.to}
              to={tab.to}
              aria-current={active ? 'page' : undefined}
              onClick={(event) => switchTab(event, tab.to)}
            >
              {/* One highlight, shared between the tabs, so it slides to the new one. A critically
                  damped spring: it arrives without overshooting. */}
              {active && (
                <motion.span className="nav-pill" layoutId="nav-pill" transition={{ type: 'spring', bounce: 0, duration: 0.35 }} />
              )}
              <span className="nav-label">{tab.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
