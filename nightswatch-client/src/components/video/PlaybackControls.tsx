import { Badge } from '../ui/Badge'
import { formatTime } from '../../utils/formatTime'
import { cn } from '../../utils/cn'
import type { SyncStatus } from '../../hooks/useSync'

interface PlaybackControlsProps {
  isController: boolean
  isPlaying: boolean
  currentTime: number
  duration: number
  syncStatus: SyncStatus
  isFullscreen: boolean
  onPlay: () => void
  onPause: () => void
  onSeek: (time: number) => void
  onFullscreen: () => void
}

export function PlaybackControls({
  isController,
  isPlaying,
  currentTime,
  duration,
  syncStatus,
  isFullscreen,
  onPlay,
  onPause,
  onSeek,
  onFullscreen,
}: PlaybackControlsProps) {
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const disabledTitle = 'Only the host can control playback'

  return (
    <div className="flex items-center gap-3 px-4 h-14 bg-surface border-t border-border flex-shrink-0">

      {/* Play / Pause */}
      <button
        onClick={isPlaying ? onPause : onPlay}
        disabled={!isController}
        title={!isController ? disabledTitle : isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        className={cn(
          'w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-150',
          isController
            ? 'text-text-primary hover:bg-hover active:scale-95'
            : 'opacity-30 cursor-not-allowed text-text-muted'
        )}
      >
        {isPlaying ? (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <rect x="3" y="2" width="4" height="12" rx="1" />
            <rect x="9" y="2" width="4" height="12" rx="1" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4 2.5l9 5.5-9 5.5V2.5z" />
          </svg>
        )}
      </button>

      {/* Timestamps + seek bar */}
      <div className="flex-1 flex items-center gap-2.5 min-w-0">
        <span className="text-xs font-mono text-text-muted flex-shrink-0 w-10 text-right">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          step={1}
          disabled={!isController}
          title={!isController ? disabledTitle : 'Seek (← →)'}
          onChange={(e) => onSeek(Number(e.target.value))}
          className={cn('flex-1', !isController && 'opacity-30 cursor-not-allowed')}
          style={{
            background: `linear-gradient(to right, #E8A838 ${progress}%, #262626 ${progress}%)`,
          }}
        />

        <span className="text-xs font-mono text-text-muted flex-shrink-0 w-10">
          {formatTime(duration)}
        </span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-1 flex-shrink-0">

        {/* Sync status */}
        <div className="mr-1">
          {syncStatus === 'LIVE'         && <Badge variant="live">LIVE</Badge>}
          {syncStatus === 'SYNCING'      && <Badge variant="syncing">Syncing</Badge>}
          {syncStatus === 'BUFFERING'    && <Badge variant="syncing">Buffering</Badge>}
          {syncStatus === 'DISCONNECTED' && <Badge variant="default">Offline</Badge>}
        </div>

        {/* Fullscreen */}
        <button
          onClick={onFullscreen}
          title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-primary transition-colors rounded hover:bg-hover"
        >
          {isFullscreen ? (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
              <path d="M5.5 0v5.5H0v1h6.5V0h-1zM9.5 0v1H14v4.5h1V0h-5.5zM0 9.5v1h5.5V15h1V9.5H0zM14 9.5V15h-4.5v1H15V9.5h-1z" />
            </svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 15 15" fill="currentColor">
              <path d="M0 0v5.5h1V1h4.5V0H0zM9.5 0v1H13v4.5h1V0H9.5zM1 9.5H0V15h5.5v-1H1V9.5zM14 9.5V14h-4.5v1H15V9.5h-1z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
