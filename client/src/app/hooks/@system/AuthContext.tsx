import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { api } from '@/app/lib/@system/api'

interface User {
  id: number
  email: string
  name: string
}

interface AuthState {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  isAuthenticated: false,
  refetch: async () => {},
})

/**
 * @system — Wraps the app and provides auth state globally.
 * Fetches the session once; all children share the result.
 *
 * Usage: wrap <App /> with <AuthProvider> in main.tsx or App.tsx.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchUser() {
    try {
      const { user } = await api.get<{ user: User }>('/sessions/me')
      setUser(user)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
