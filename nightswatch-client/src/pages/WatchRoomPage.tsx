import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { VideoEmbed } from '../components/video/VideoEmbed'
import { PlaybackControls } from '../components/video/PlaybackControls'
import { ParticipantList } from '../components/participants/ParticipantList'
import { RoomHeader } from '../components/room/RoomHeader'
import { ChangeVideoModal } from '../components/room/ChangeVideoModal'
import { Button } from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'
import { usePresence } from '../hooks/usePresence'
import { useSync } from '../hooks/useSync'
import { useYouTubePlayer, useVimeoPlayer, useVideoPlayer } from '../hooks/useYouTubePlayer'
import { useFullscreen } from '../hooks/useFullscreen'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useRoomStore } from '../store/roomStore'
import { useToastStore } from '../store/toastStore'
import { roomService } from '../services/roomService'
import { detectProvider } from '../utils/videoProviders'
import { cn } from '../utils/cn'
import type { SyncMessage } from '../types/sync'

export function WatchRoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>()
  const navigate = useNavigate()
  const { user, token, isAuthenticated } = useAuth()
  const push = useToastStore((s) => s.push)
  const { room, setRoom, clearRoom, addParticipant, participants } = useRoomStore()

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [changeVideoOpen, setChangeVideoOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Determine provider to choose the right player hook — hooks always called
  // Must always be called (hooks rule) — provider selects which one is active
  const provider = room?.currentVideoUrl ? detectProvider(room.currentVideoUrl) : 'UNKNOWN'
  const ytPlayer = useYouTubePlayer(iframeRef)
  const vimeoPlayer = useVimeoPlayer(iframeRef)
  const videoPlayer = useVideoPlayer(videoRef)

  const player =
    provider === 'DIRECT_VIDEO' ? videoPlayer
    : provider === 'VIMEO' ? vimeoPlayer
    : ytPlayer

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) navigate('/')
  }, [isAuthenticated])

  // Load room
  useEffect(() => {
    if (!roomCode || !user) return
    setLoading(true)
    roomService.get(roomCode)
      .then((r) => {
        if (!r.isActive) { setError('This room is no longer active.'); return }
        setRoom(r)
        addParticipant(user.username)
      })
      .catch(() => setError('Room not found.'))
      .finally(() => setLoading(false))
    return () => clearRoom()
  }, [roomCode])

  // Permission grant toast
  const prevPermissions = useRef<string[]>([])
  useEffect(() => {
    if (!room || !user) return
    const hadControl = prevPermissions.current.includes(user.username)
    const hasControl = room.streamPermissions.includes(user.username)
    if (!hadControl && hasControl && room.hostId !== user.username) {
      push('You have playback control', 'control', 5000)
    }
    prevPermissions.current = [...room.streamPermissions]
  }, [room?.streamPermissions])

  const isController =
    !!user && !!room &&
    (room.hostId === user.username || room.streamPermissions.includes(user.username))

  const isHost = !!user && !!room && room.hostId === user.username

  // Socket & presence
  const socket = useSocket(token)
  usePresence(roomCode ?? '', socket, user?.username ?? '')

  // Handle incoming sync messages.
  // Depend only on the stable command fns (memoized in player hooks), not the
  // whole player object — player includes currentTime which changes every 250ms
  // and would cause useSync to re-subscribe on every tick, dropping messages.
  const handleSyncReceived = useCallback((msg: SyncMessage) => {
    if (msg.videoTimestamp === -1 && roomCode) {
      roomService.get(roomCode).then(setRoom).catch(() => {})
      return
    }
    if (msg.action === 'PLAY') {
      player.seekTo(msg.videoTimestamp)
      player.play()
    } else if (msg.action === 'PAUSE') {
      player.seekTo(msg.videoTimestamp)
      player.pause()
    } else if (msg.action === 'SEEK') {
      player.seekTo(msg.videoTimestamp)
    }
  }, [player.seekTo, player.play, player.pause, roomCode])

  const { syncStatus, flashSync, sendSync } = useSync({
    roomCode: roomCode ?? '',
    socket,
    isController,
    onReceive: handleSyncReceived,
  })

  // Controller actions — update player then broadcast
  const handlePlay = () => {
    player.play()
    sendSync('PLAY', player.currentTime)
  }

  const handlePause = () => {
    player.pause()
    sendSync('PAUSE', player.currentTime)
  }

  const handleSeek = (time: number) => {
    player.seekTo(time)
    sendSync('SEEK', time)
  }

  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(containerRef)

  useKeyboardShortcuts({
    onPlayPause: () => (player.isPlaying ? handlePause() : handlePlay()),
    onSeekBack: () => handleSeek(Math.max(0, player.currentTime - 10)),
    onSeekForward: () => handleSeek(Math.min(player.duration, player.currentTime + 10)),
    enabled: isController,
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-3">
        <span className="w-7 h-7 border-2 border-border border-t-amber rounded-full animate-spin" />
        <p className="text-xs text-text-muted">Loading room…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-void flex flex-col items-center justify-center gap-5 px-4">
        <div className="w-14 h-14 rounded-2xl bg-elevated border border-border flex items-center justify-center text-2xl text-text-muted/30">
          ◈
        </div>
        <div className="text-center">
          <p className="text-text-primary font-medium mb-1">Room unavailable</p>
          <p className="text-text-secondary text-sm">{error}</p>
        </div>
        <Button onClick={() => navigate('/lobby')}>Back to Lobby</Button>
      </div>
    )
  }

  return (
    <div className="h-screen bg-void flex flex-col overflow-hidden">
      <RoomHeader
        roomCode={roomCode ?? ''}
        isHost={isHost}
        participantCount={participants.length}
        onChangeVideo={() => setChangeVideoOpen(true)}
        onToggleSidebar={() => setSidebarOpen((o) => !o)}
        sidebarOpen={sidebarOpen}
      />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Video panel */}
        <div ref={containerRef} className="flex-1 flex flex-col bg-void min-w-0">
          <div className="flex-1 flex items-center justify-center p-4 min-h-0">
            {room?.currentVideoUrl ? (
              <motion.div
                className={cn(
                  'w-full rounded-xl overflow-hidden shadow-2xl',
                  flashSync && 'animate-sync-flash'
                )}
                style={{
                  aspectRatio: '16/9',
                  maxHeight: 'calc(100vh - 48px - 56px - 32px)',
                }}
              >
                <VideoEmbed
                  ref={
                    provider === 'DIRECT_VIDEO'
                      ? (videoRef as React.Ref<HTMLIFrameElement | HTMLVideoElement>)
                      : (iframeRef as React.Ref<HTMLIFrameElement | HTMLVideoElement>)
                  }
                  url={room.currentVideoUrl}
                  onLoad={player.onIframeLoad}
                  className="w-full h-full"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center gap-5 text-center max-w-xs px-4"
              >
                <div className="w-16 h-16 rounded-2xl bg-elevated border border-border flex items-center justify-center text-2xl text-text-muted/30">
                  ◈
                </div>
                <div>
                  <p className="text-text-primary font-medium text-sm mb-1">No video loaded</p>
                  <p className="text-text-muted text-xs leading-relaxed">
                    {isHost
                      ? 'Add a YouTube or Vimeo link to start watching.'
                      : 'Waiting for the host to add a video.'}
                  </p>
                </div>
                {isHost && (
                  <button
                    onClick={() => setChangeVideoOpen(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber hover:brightness-110 transition-all bg-amber/10 hover:bg-amber/15 px-3.5 py-2 rounded-lg border border-amber/20"
                  >
                    <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                      <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Add a video
                  </button>
                )}
              </motion.div>
            )}
          </div>

          <PlaybackControls
            isController={isController}
            isPlaying={player.isPlaying}
            currentTime={player.currentTime}
            duration={player.duration}
            syncStatus={syncStatus}
            isFullscreen={isFullscreen}
            onPlay={handlePlay}
            onPause={handlePause}
            onSeek={handleSeek}
            onFullscreen={toggleFullscreen}
          />
        </div>

        {/* Desktop sidebar */}
        <aside className="w-72 lg:w-80 flex-shrink-0 bg-elevated border-l border-border flex-col hidden sm:flex overflow-hidden">
          <div className="flex-1 min-h-0 overflow-y-auto">
            <ParticipantList currentUserId={user?.username ?? ''} connected={socket.connected} />
          </div>
          <div className="p-3 border-t border-border flex-shrink-0">
            <button
              onClick={() => navigate('/lobby')}
              className="w-full flex items-center justify-center gap-2 text-xs text-text-muted hover:text-danger transition-colors py-2 rounded-lg hover:bg-danger/5"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M4.5 2H2C1.45 2 1 2.45 1 3V9C1 9.55 1.45 10 2 10H4.5M7.5 4L10 6L7.5 8M10 6H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Leave Room
            </button>
          </div>
        </aside>

        {/* Mobile sidebar — bottom sheet */}
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-void/70 z-20 sm:hidden"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="absolute bottom-0 left-0 right-0 z-30 sm:hidden bg-elevated rounded-t-2xl border-t border-border max-h-[70vh] flex flex-col"
              >
                {/* Drag handle */}
                <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                  <div className="w-10 h-1 rounded-full bg-border" />
                </div>
                <div className="flex-1 overflow-y-auto py-2">
                  <ParticipantList currentUserId={user?.username ?? ''} connected={socket.connected} />
                </div>
                <div className="p-3 border-t border-border flex-shrink-0">
                  <button
                    onClick={() => navigate('/lobby')}
                    className="w-full flex items-center justify-center gap-2 text-xs text-text-muted hover:text-danger transition-colors py-2 rounded-lg hover:bg-danger/5"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M4.5 2H2C1.45 2 1 2.45 1 3V9C1 9.55 1.45 10 2 10H4.5M7.5 4L10 6L7.5 8M10 6H4.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Leave Room
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>

      <ChangeVideoModal
        open={changeVideoOpen}
        onClose={() => setChangeVideoOpen(false)}
        onChanged={() => sendSync('SEEK', -1)}  // -1 = reload signal for viewers
      />
    </div>
  )
}
