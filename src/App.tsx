import { useLayoutEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RouteChange } from './components/RouteChange'
import { CafeDrinkPage } from './screens/CafeDrinkPage'
import { CafeRoom } from './screens/CafeRoom'
import { KopitiamRoom } from './screens/KopitiamRoom'
import { MakingMode } from './screens/MakingMode'
import { NotFound } from './screens/NotFound'
import { OrderPage } from './screens/OrderPage'
import { Terms } from './screens/Terms'
import { Words } from './screens/Words'
import { useUserData } from './storage/UserDataContext'
import { applyTheme, roomForPath } from './theme/applyTheme'

// Screens still to be built show their name, so routing can be tested now.
const Placeholder = ({ name }: { name: string }) => <h1>{name}</h1>

export default function App() {
  const { data } = useUserData()
  const { pathname } = useLocation()
  const { theme, scheme } = data.settings
  const room = roomForPath(pathname)

  // Before paint, so a screen change captures the new room already in its own colours.
  useLayoutEffect(() => applyTheme(theme, scheme, room), [theme, scheme, room])

  return (
    <>
      <RouteChange />
      <Routes>
        <Route path="/kopitiam/:id/make" element={<MakingMode room="kopitiam" />} />
        <Route path="/cafe/:id/make" element={<MakingMode room="cafe" />} />
        <Route element={<Layout />}>
          <Route path="/" element={<KopitiamRoom />} />
          <Route path="/kopitiam/:id" element={<OrderPage />} />
          <Route path="/words" element={<Words />} />
          <Route path="/cafe" element={<CafeRoom />} />
          <Route path="/cafe/:id" element={<CafeDrinkPage />} />
          <Route path="/saved" element={<Placeholder name="Saved" />} />
          <Route path="/settings" element={<Placeholder name="Settings" />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}
