// @system — route guard that redirects unauthenticated users to /auth
// Also redirects new users (onboarding not complete) to /onboarding.
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthContext } from '@/app/store/@system/auth'
import { Spinner } from '../Loading/Spinner'
import { EmailVerificationBanner } from '../EmailVerificationBanner/EmailVerificationBanner'

interface ProtectedRouteProps {
  children: React.ReactNode
  /** Role required to access the route. Defaults to any authenticated user. */
  role?: 'admin' | 'user'
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuthContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />
  }

  // Redirect new users to onboarding wizard before accessing the app
  if (user && user.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />
  }

  if (role === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/app" replace />
  }

  return (
    <>
      <EmailVerificationBanner />
      {children}
    </>
  )
}
