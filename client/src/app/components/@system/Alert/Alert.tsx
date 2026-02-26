// @system — alert / callout component with semantic variants
import { cva, type VariantProps } from 'class-variance-authority'
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react'
import { cn } from '@/app/lib/@system/utils'
import { useState } from 'react'

const alertVariants = cva(
  'relative flex items-start gap-3 rounded-lg border p-4 text-sm',
  {
    variants: {
      variant: {
        default: 'bg-background text-foreground',
        info: 'border-blue-200 bg-blue-50 text-blue-900',
        success: 'border-green-200 bg-green-50 text-green-900',
        warning: 'border-yellow-200 bg-yellow-50 text-yellow-900',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

const ICONS = {
  default: Info,
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  destructive: AlertCircle,
}

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {
  title?: string
  dismissible?: boolean
}

export function Alert({ className, variant = 'default', title, dismissible, children, ...props }: AlertProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  const Icon = ICONS[variant ?? 'default']

  return (
    <div className={cn(alertVariants({ variant }), className)} role="alert" {...props}>
      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
      <div className="flex-1 space-y-1">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className="text-sm opacity-90">{children}</div>}
      </div>
      {dismissible && (
        <button
          onClick={() => setDismissed(true)}
          className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
