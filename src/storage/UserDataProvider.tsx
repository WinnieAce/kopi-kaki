import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { useContent } from '../content/ContentContext'
import type { UserDataStore } from './store'
import { defaultUserData, sameDrink, tidyUserData, type UserData } from './userData'
import { UserDataContext, type UserDataValue } from './UserDataContext'

export function UserDataProvider({ store, children }: { store: UserDataStore; children: ReactNode }) {
  const { content } = useContent()
  const [data, setData] = useState<UserData | null>(null)
  const [persistent, setPersistent] = useState(store.persistent)
  const latest = useRef<UserData | null>(null)
  const askedToPersist = useRef(false)

  useEffect(() => {
    let cancelled = false
    const start = (loaded: UserData | null) => {
      if (cancelled) return
      latest.current = tidyUserData(loaded ?? defaultUserData(), content)
      setData(latest.current)
    }
    store.load().then(start, () => {
      setPersistent(false)
      start(null)
    })
    return () => {
      cancelled = true
    }
  }, [store, content])

  const update = useCallback(
    (change: (current: UserData) => UserData) => {
      if (!latest.current) return
      latest.current = tidyUserData(change(latest.current), content)
      setData(latest.current)
      // A failed save, such as a full device, leaves the data in memory and shows the not-saved notice.
      store.save(latest.current).catch(() => setPersistent(false))
      // Without this, some browsers (notably Safari) may clear a site's data after a week unvisited.
      if (!askedToPersist.current) {
        askedToPersist.current = true
        navigator.storage?.persist?.().catch(() => {})
      }
    },
    [store, content],
  )

  const value = useMemo<UserDataValue | null>(() => {
    if (!data) return null
    const without = (d: UserData, drink: Parameters<UserDataValue['toggleSaved']>[0]) => d.saved.filter((s) => !sameDrink(s, drink))
    return {
      data,
      persistent,
      toggleSaved: (drink) =>
        update((d) => ({ ...d, saved: d.saved.some((s) => sameDrink(s, drink)) ? without(d, drink) : [...d.saved, drink] })),
      removeSaved: (drink) => {
        const index = latest.current?.saved.findIndex((s) => sameDrink(s, drink)) ?? -1
        update((d) => ({ ...d, saved: without(d, drink) }))
        return index
      },
      restoreSaved: (drink, index) =>
        update((d) => {
          const saved = without(d, drink)
          saved.splice(index < 0 ? saved.length : Math.min(index, saved.length), 0, drink)
          return { ...d, saved }
        }),
      setUsual: (drink) => update((d) => ({ ...d, usual: drink })),
      setTheme: (theme) => update((d) => ({ ...d, settings: { ...d.settings, theme } })),
      setScheme: (scheme) => update((d) => ({ ...d, settings: { ...d.settings, scheme } })),
      replaceAll: (next) => update(() => next),
    }
  }, [data, persistent, update])

  // Nothing is shown until saved data has loaded, so a returning visitor never sees an empty state flash.
  if (!value) return null
  return <UserDataContext.Provider value={value}>{children}</UserDataContext.Provider>
}
