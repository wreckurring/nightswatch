import { getAvatarColor, getInitials } from '../../utils/avatarColor'
import { cn } from '../../utils/cn'

interface AvatarProps {
  userId: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
  online?: boolean
}

export function Avatar({ userId, size = 'md', className, online }: AvatarProps) {
  const color = getAvatarColor(userId)
  const initials = getInitials(userId)

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  }

  return (
    <div className={cn('relative flex-shrink-0', className)}>
      <div
        className={cn(
          'rounded-full flex items-center justify-center font-semibold text-void select-none',
          sizeClasses[size]
        )}
        style={{ backgroundColor: color }}
      >
        {initials}
      </div>
      {online !== undefined && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2 h-2 rounded-full border border-elevated',
            online ? 'bg-presence' : 'bg-text-muted'
          )}
        />
      )}
    </div>
  )
}
