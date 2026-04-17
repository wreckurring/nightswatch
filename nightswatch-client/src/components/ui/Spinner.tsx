import { cn } from '../../utils/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block w-5 h-5 border-2 border-text-muted border-t-amber rounded-full animate-spin',
        className
      )}
    />
  )
}
