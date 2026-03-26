/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useMemo, useState } from 'react'
import { clearStoredAuth, getStoredAuth, persistAuth } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => getStoredAuth())

  const value = useMemo(
    () => ({
      auth,
      isAuthenticated: Boolean(auth?.token),
      user: auth?.user ?? null,
      setAuthSession: (authData) => {
        const next = persistAuth(authData)
        setAuth(next)
      },
      logout: () => {
        clearStoredAuth()
        setAuth(null)
      },
    }),
    [auth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
