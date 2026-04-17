import { AnimatePresence } from 'framer-motion'
import { ParticipantItem } from './ParticipantItem'
import { useRoomStore } from '../../store/roomStore'
import { useToastStore } from '../../store/toastStore'
import { roomService } from '../../services/roomService'

interface ParticipantListProps {
  currentUserId: string
  connected?: boolean
}

export function ParticipantList({ currentUserId, connected = true }: ParticipantListProps) {
  const { room, participants, setStreamPermissions } = useRoomStore()
  const push = useToastStore((s) => s.push)

  if (!room) return null

  const isHost = room.hostId === currentUserId

  const handleGrant = async (userId: string) => {
    try {
      const updated = await roomService.grantPermission(room.roomCode, userId)
      setStreamPermissions(updated.streamPermissions)
      push(`${userId} can now control playback`, 'control', 4000)
    } catch {
      push('Failed to grant permission', 'error')
    }
  }

  const handleRevoke = async (userId: string) => {
    try {
      const updated = await roomService.revokePermission(room.roomCode, userId)
      setStreamPermissions(updated.streamPermissions)
      push(`${userId} playback control removed`, 'info', 3000)
    } catch {
      push('Failed to revoke permission', 'error')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">
            In this room
          </span>
          <span
            title={connected ? 'Connected' : 'Reconnecting…'}
            className={[
              'w-1.5 h-1.5 rounded-full transition-colors flex-shrink-0',
              connected ? 'bg-success animate-live-pulse' : 'bg-text-muted opacity-50',
            ].join(' ')}
          />
        </div>
        <span className="text-xs tabular-nums font-medium text-text-muted bg-hover border border-border rounded-full px-2 py-0.5 min-w-[1.5rem] text-center">
          {participants.length}
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto py-1.5 px-1">
        {participants.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-10 px-4 text-center">
            <div className="w-9 h-9 rounded-full bg-hover border border-border flex items-center justify-center text-text-muted text-sm">
              ●
            </div>
            <p className="text-xs text-text-muted">No one else has joined yet.</p>
            <p className="text-[11px] text-text-muted/60">Share the room code to invite friends.</p>
          </div>
        ) : (
          <AnimatePresence mode="sync">
            {participants.map((p) => (
              <ParticipantItem
                key={p.userId}
                userId={p.userId}
                isHost={room.hostId === p.userId}
                isCurrentUser={p.userId === currentUserId}
                hasControl={room.streamPermissions.includes(p.userId)}
                canGrant={isHost}
                onGrant={() => handleGrant(p.userId)}
                onRevoke={() => handleRevoke(p.userId)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Keyboard hint */}
      <div className="px-4 py-2.5 border-t border-border/50">
        <div className="flex items-center justify-center gap-3">
          {[
            { key: 'Space', label: 'Play/Pause' },
            { key: '← →', label: 'Seek 10s' },
          ].map((k) => (
            <div key={k.key} className="flex items-center gap-1.5">
              <kbd className="text-[10px] font-mono bg-hover border border-border rounded px-1.5 py-0.5 text-text-muted">
                {k.key}
              </kbd>
              <span className="text-[10px] text-text-muted/60">{k.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
