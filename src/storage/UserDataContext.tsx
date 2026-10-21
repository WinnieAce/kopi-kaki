import { createContext, useContext } from 'react'
import type { CafeScheme, Theme } from '../theme/palettes'
import type { SavedDrink, UserData } from './userData'

export type UserDataValue = {
  data: UserData
  /** False when changes last only for this browser session. */
  persistent: boolean
  /** Saves the drink, or removes it if it is already saved. */
  toggleSaved(drink: SavedDrink): void
  /** Removes the drink and returns where it was, for Undo. */
  removeSaved(drink: SavedDrink): number
  /** Puts a removed drink back where it was. */
  restoreSaved(drink: SavedDrink, index: number): void
  setUsual(drink: SavedDrink | null): void
  setTheme(theme: Theme): void
  setScheme(scheme: CafeScheme): void
  replaceAll(data: UserData): void
}

export const UserDataContext = createContext<UserDataValue | null>(null)

export function useUserData(): UserDataValue {
  const value = useContext(UserDataContext)
  if (!value) throw new Error('useUserData must be used inside UserDataProvider')
  return value
}
