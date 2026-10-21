import { MotionConfig } from 'motion/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import { createStore } from './storage/store'
import { UserDataProvider } from './storage/UserDataProvider'
import { applyCachedTheme, roomForPath } from './theme/applyTheme'
import './fonts/fonts.css'
import './fonts/zh/zh.css'
import './styles.css'

applyCachedTheme(roomForPath(window.location.pathname))

// Registers the offline cache. The returned update function is deliberately never called:
// a new version takes over only once every tab of the app has been closed.
registerSW()

createStore().then((store) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      {/* With "reduce motion" on, Motion keeps fades and drops movement. */}
      <MotionConfig reducedMotion="user">
        <UserDataProvider store={store}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </UserDataProvider>
      </MotionConfig>
    </StrictMode>,
  )
})
