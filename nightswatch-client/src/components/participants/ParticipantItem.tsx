import { motion } from 'framer-motion'
import { Avatar } from '../ui/Avatar'
import { Badge } from '../ui/Badge'
import { cn } from '../../utils/cn'

interface ParticipantItemProps {
  userId: string
  isHost: boolean
  isCurrentUser: boolean
  hasControl: boolean
  canGrant: boolean
  onGrant: () => void
  onRevoke: () => void
}

export function ParticipantItem({
  userId,
  isHost,
  isCurrentUser,
  hasControl,
  canGrant,
  onGrant,
  onRevoke,
}: ParticipantItemProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16 }}
      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      className="flex items-center gap-3 px-3 py-2 group hover:bg-hover/60 rounded-lg transition-colors mx-0.5"
    >
      <Avatar userId={userId} online size="sm" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn(
            'text-sm truncate font-medium',
            isCurrentUser ? 'text-text-primary' : 'text-text-secondary'
          )}>
            {userId}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] text-text-muted flex-shrink-0">(you)</span>
          )}
        </div>
      </div>

      {/* Badges + action */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {isHost && <Badge variant="host">Host</Badge>}
        {!isHost && hasControl && <Badge variant="control">⌘</Badge>}

        {canGrant && !isHost && (
          <button
            onClick={hasControl ? onRevoke : onGrant}
            title={hasControl ? 'Revoke playback control' : 'Grant playback control'}
            className={cn(
              'opacity-0 group-hover:opacity-100 transition-all duration-150',
              'w-6 h-6 rounded-md flex items-center justify-center text-xs',
              hasControl
                ? 'text-amber bg-amber/10 hover:bg-amber/20'
                : 'text-text-muted hover:text-amber hover:bg-amber/10'
            )}
          >
            ⇄
          </button>
        )}
      </div>
    </motion.div>
  )
}
