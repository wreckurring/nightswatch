import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoomStore } from '../../store/roomStore'
import { cn } from '../../utils/cn'

interface RoomHeaderProps {
  roomCode: string
  isHost: boolean
  participantCount: number
  onChangeVideo: () => void
  onToggleSidebar: () => void
  sidebarOpen: boolean
}

export function RoomHeader({
  roomCode,
  isHost,
  participantCount,
  onChangeVideo,
  onToggleSidebar,
  sidebarOpen,
}: RoomHeaderProps) {
  const navigate = useNavigate()
  const [copied, setCopied] = useState(false)
  const room = useRoomStore((s) => s.room)

  const handleShare = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/room/${roomCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <header className="flex items-center justify-between px-4 h-12 border-b border-border flex-shrink-0 bg-surface/90 backdrop-blur-sm">

      {/* Left: logo + nav back */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => navigate('/lobby')}
          className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors group flex-shrink-0"
          title="Back to lobby"
        >
          <span className="text-amber group-hover:brightness-110 transition-all text-base leading-none">◈</span>
        </button>

        {/* Separator + room info */}
        <div className="w-px h-4 bg-border flex-shrink-0" />
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-text-primary truncate hidden sm:block">
            {room?.hostId ? `${room.hostId}'s room` : 'Watch Room'}
          </span>
          <span className="font-mono text-xs text-text-muted tracking-[0.18em] bg-hover px-2 py-0.5 rounded-md select-all flex-shrink-0">
            {roomCode}
          </span>
        </div>
      </div>

      {/* Center: host action */}
      {isHost && (
        <button
          onClick={onChangeVideo}
          className="hidden sm:flex items-center gap-1.5 text-xs text-text-muted hover:text-amber transition-colors px-2.5 py-1.5 rounded-lg hover:bg-hover border border-transparent hover:border-amber/20"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          </svg>
          <span>Change video</span>
        </button>
      )}

      {/* Right: share + mobile toggle */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleShare}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all duration-150 font-medium',
            copied
              ? 'text-success bg-success/10 border border-success/20'
              : 'text-text-muted hover:text-amber border border-border hover:border-amber/30 hover:bg-amber/5'
          )}
        >
          {copied ? (
            <>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M1.5 5.5L4.5 8.5L9.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <path d="M7 1H10V4M10 1L6 5M4 2H2C1.45 2 1 2.45 1 3V9C1 9.55 1.45 10 2 10H8C8.55 10 9 9.55 9 9V7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              Share
            </>
          )}
        </button>

        {/* Mobile sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          className="sm:hidden flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors px-2.5 py-1.5 rounded-lg hover:bg-hover border border-border"
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full transition-colors',
              sidebarOpen ? 'bg-amber animate-live-pulse' : 'bg-success animate-live-pulse'
            )}
          />
          <span>{participantCount}</span>
        </button>
      </div>
    </header>
  )
}
