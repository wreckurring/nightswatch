import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { roomService } from '../../services/roomService'
import { mediaService } from '../../services/mediaService'
import { useAuthStore } from '../../store/authStore'
import { detectProvider } from '../../utils/videoProviders'
import { useToastStore } from '../../store/toastStore'

interface CreateRoomModalProps {
  open: boolean
  onClose: () => void
}

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  YOUTUBE:      { label: 'YouTube',      color: 'text-danger' },
  VIMEO:        { label: 'Vimeo',        color: 'text-presence' },
  DIRECT_VIDEO: { label: 'Direct video', color: 'text-success' },
}

export function CreateRoomModal({ open, onClose }: CreateRoomModalProps) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const push = useToastStore((s) => s.push)

  const [videoUrl, setVideoUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState<{ provider: string; supported: boolean } | null>(null)

  useEffect(() => {
    if (!videoUrl) { setAnalyzed(null); return }
    const provider = detectProvider(videoUrl)
    if (provider === 'UNKNOWN') { setAnalyzed(null); return }

    const timer = setTimeout(async () => {
      setAnalyzing(true)
      try {
        const res = await mediaService.analyze(videoUrl)
        setAnalyzed({ provider: res.provider, supported: res.supported })
      } catch {
        setAnalyzed(null)
      } finally {
        setAnalyzing(false)
      }
    }, 600)
    return () => clearTimeout(timer)
  }, [videoUrl])

  const handleCreate = async () => {
    if (!user) return
    setLoading(true)
    try {
      const room = await roomService.create({
        hostId: user.username,
        currentVideoUrl: videoUrl || undefined,
      })
      onClose()
      navigate(`/room/${room.roomCode}`)
    } catch {
      push('Failed to create room', 'error')
    } finally {
      setLoading(false)
    }
  }

  const meta = analyzed ? PROVIDER_META[analyzed.provider] : null

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber/15 border border-amber/25 flex items-center justify-center text-amber text-base flex-shrink-0 mt-0.5">
            ◈
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">Create a Room</h2>
            <p className="text-sm text-text-muted mt-0.5">
              Start a watch party. You can add a video now or later.
            </p>
          </div>
        </div>

        {/* URL input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            Video URL <span className="text-text-muted normal-case tracking-normal font-normal">(optional)</span>
          </label>
          <div className="relative">
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className={[
                'w-full bg-void border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
                analyzed ? 'pr-24' : 'pr-10',
                'placeholder:text-text-muted',
                'outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,168,56,0.12)]',
                'transition-all duration-150',
              ].join(' ')}
            />
            {/* Right badge */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {analyzing && (
                <span className="w-3.5 h-3.5 border-2 border-border border-t-amber rounded-full animate-spin" />
              )}
              {!analyzing && meta && (
                <span className={`text-xs font-medium flex items-center gap-1 ${meta.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {meta.label}
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-text-muted/70 leading-relaxed">
            Supports YouTube, Vimeo, and direct video links. You can also skip this and add later.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} loading={loading} className="flex-1">
            Create Room
          </Button>
        </div>
      </div>
    </Modal>
  )
}
