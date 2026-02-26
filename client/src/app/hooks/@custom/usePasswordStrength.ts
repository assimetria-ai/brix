import { useMemo } from 'react'

export type StrengthLevel = 'weak' | 'fair' | 'good' | 'strong'

export interface PasswordRequirement {
  key: string
  label: string
  met: boolean
}

export interface PasswordStrength {
  score: number        // 0–5
  level: StrengthLevel
  label: string
  requirements: PasswordRequirement[]
  color: string        // Tailwind bg class
  textColor: string    // Tailwind text class
  percent: number      // 0–100 for progress display
}

function evaluate(password: string): PasswordStrength {
  const requirements: PasswordRequirement[] = [
    {
      key: 'minLength',
      label: 'At least 8 characters',
      met: password.length >= 8,
    },
    {
      key: 'longLength',
      label: 'At least 12 characters',
      met: password.length >= 12,
    },
    {
      key: 'uppercase',
      label: 'One uppercase letter (A–Z)',
      met: /[A-Z]/.test(password),
    },
    {
      key: 'number',
      label: 'One number (0–9)',
      met: /[0-9]/.test(password),
    },
    {
      key: 'special',
      label: 'One special character (!@#…)',
      met: /[^A-Za-z0-9]/.test(password),
    },
  ]

  const score = requirements.filter((r) => r.met).length

  let level: StrengthLevel
  let label: string
  let color: string
  let textColor: string

  if (score <= 1) {
    level = 'weak'
    label = 'Weak'
    color = 'bg-destructive'
    textColor = 'text-destructive'
  } else if (score === 2) {
    level = 'fair'
    label = 'Fair'
    color = 'bg-orange-400'
    textColor = 'text-orange-500'
  } else if (score === 3) {
    level = 'good'
    label = 'Good'
    color = 'bg-yellow-400'
    textColor = 'text-yellow-600'
  } else {
    level = 'strong'
    label = 'Strong'
    color = 'bg-green-500'
    textColor = 'text-green-600'
  }

  return {
    score,
    level,
    label,
    requirements,
    color,
    textColor,
    percent: Math.round((score / 5) * 100),
  }
}

export function usePasswordStrength(password: string): PasswordStrength | null {
  return useMemo(() => {
    if (!password) return null
    return evaluate(password)
  }, [password])
}
