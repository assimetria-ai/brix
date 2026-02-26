// @system — Onboarding page
// Shown to first-time users immediately after registration.
// Renders the OnboardingWizard in a full-page centered layout.
// Route: /onboarding (public after auth — redirect handled by ProtectedRoute)

import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/app/store/@system/auth'
import { OnboardingWizard } from '../../../components/@system/OnboardingWizard/OnboardingWizard'
import { Spinner } from '../../../components/@system/Loading/Spinner'
import { info } from '@/config/@system/info'

export function OnboardingPage() {
  const { user, loading, isAuthenticated } = useAuthContext()

  // Still loading the session — show spinner
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner />
      </div>
    )
  }

  // Not logged in — redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  // Already completed onboarding — skip to app
  if (user?.onboardingCompleted) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal header — just the logo */}
      <header className="flex items-center px-6 py-5 border-b border-border/40">
        <span className="text-lg font-bold tracking-tight">{info.name}</span>
      </header>

      {/* Centered wizard */}
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          <OnboardingWizard />
        </div>
      </main>

      {/* Footer */}
      <footer className="flex items-center justify-center px-6 py-4 text-xs text-muted-foreground">
        <span>© {new Date().getFullYear()} {info.name}. All rights reserved.</span>
      </footer>
    </div>
  )
}
