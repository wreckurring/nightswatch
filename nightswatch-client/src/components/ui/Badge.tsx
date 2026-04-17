import { cn } from '../../utils/cn'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'host' | 'live' | 'syncing' | 'control' | 'default'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded',
        {
          'bg-amber/20 text-amber': variant === 'host',
          'bg-amber/15 text-amber': variant === 'live',
          'bg-text-muted/20 text-text-muted': variant === 'syncing',
          'bg-presence/15 text-presence': variant === 'control',
          'bg-border text-text-muted': variant === 'default',
        },
        className
      )}
    >
      {variant === 'live' && (
        <span className="w-1.5 h-1.5 rounded-full bg-amber animate-live-pulse" />
      )}
      {children}
    </span>
  )
}
