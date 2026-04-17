import { cn } from '../../utils/cn'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full bg-void border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
          'placeholder:text-text-muted',
          'transition-all duration-150',
          'outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,168,56,0.12)]',
          error && 'border-danger focus:border-danger focus:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  )
}
