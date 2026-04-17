import { cn } from '../../utils/cn'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 select-none',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        {
          'bg-amber text-void hover:brightness-110 active:scale-[0.98]':
            variant === 'primary',
          'bg-transparent text-text-secondary hover:text-text-primary hover:bg-hover':
            variant === 'ghost',
          'bg-transparent text-danger border border-danger/30 hover:bg-danger/10':
            variant === 'danger',
          'bg-transparent text-text-primary border border-border hover:border-border/80 hover:bg-hover':
            variant === 'outline',
        },
        {
          'text-xs px-3 py-1.5 gap-1.5': size === 'sm',
          'text-sm px-4 py-2 gap-2': size === 'md',
          'text-base px-5 py-2.5 gap-2': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : null}
      {children}
    </button>
  )
}
