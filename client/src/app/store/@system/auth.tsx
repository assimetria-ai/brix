// @system — Auth context: provides user, login, logout, register to the whole app
// Wrap your root component (or App) with <AuthProvider>.
// Consume with useAuthContext() in any component.

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api } from '../../lib/@system/api'

export interface User {
  id: number
  email: string
  name: string
  role: 'user' | 'admin'
  emailVerified: boolean
  onboardingCompleted: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refresh: () => Promise<void>
  updateUser: (fields: Partial<Pick<User, 'name' | 'email'>>) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  completeOnboarding: (data?: { name?: string; useCase?: string; referralSource?: string }) => Promise<void>
}

type AuthContextValue = AuthState & AuthActions

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    try {
      const { user } = await api.get<{ user: User }>('/sessions/me')
      setUser(user)
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refresh().finally(() => setLoading(false))
  }, [refresh])

  const login = useCallback(async (email: string, password: string) => {
    const { user } = await api.post<{ user: User }>('/sessions', { email, password })
    setUser(user)
  }, [])

  const register = useCallback(async (name: string, email: string, password: string) => {
    await api.post('/users', { name, email, password })
    await login(email, password)
  }, [login])

  const logout = useCallback(async () => {
    await api.delete('/sessions')
    setUser(null)
  }, [])

  const updateUser = useCallback(async (fields: Partial<Pick<User, 'name' | 'email'>>) => {
    const { user: updated } = await api.patch<{ user: User }>('/users/me', fields)
    setUser(updated)
  }, [])

  const resendVerificationEmail = useCallback(async () => {
    await api.post('/users/email/verify/request', {})
  }, [])

  const completeOnboarding = useCallback(async (data?: { name?: string; useCase?: string; referralSource?: string }) => {
    const { user: updated } = await api.post<{ user: User }>('/onboarding/complete', data ?? {})
    setUser(updated)
  }, [])

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, register, logout, refresh, updateUser, resendVerificationEmail, completeOnboarding }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used inside <AuthProvider>')
  return ctx
}

/** Convenience alias for backwards compat with useAuth hook */
export { useAuthContext as useAuth }
