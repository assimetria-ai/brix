// @system — app sidebar layout component
import { cn } from '@/app/lib/@system/utils'

interface SidebarProps {
  children: React.ReactNode
  className?: string
}

interface SidebarItemProps {
  icon?: React.ReactNode
  label: string
  active?: boolean
  onClick?: () => void
  className?: string
}

function Sidebar({ children, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'flex h-full w-64 flex-col border-r bg-background px-3 py-4',
        className
      )}
    >
      {children}
    </aside>
  )
}

function SidebarSection({ children, className }: SidebarProps) {
  return <div className={cn('flex flex-col gap-1', className)}>{children}</div>
}

function SidebarItem({ icon, label, active, onClick, className }: SidebarItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        className
      )}
    >
      {icon}
      {label}
    </button>
  )
}

export { Sidebar, SidebarSection, SidebarItem }
