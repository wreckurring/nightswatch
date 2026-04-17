import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { roomService } from '../../services/roomService'
import { mediaService } from '../../services/mediaService'
import { useRoomStore } from '../../store/roomStore'
import { useToastStore } from '../../store/toastStore'
import { detectProvider } from '../../utils/videoProviders'

interface ChangeVideoModalProps {
  open: boolean
  onClose: () => void
  onChanged?: () => void
}

const PROVIDER_META: Record<string, { label: string; color: string }> = {
  YOUTUBE:      { label: 'YouTube',      color: 'text-danger' },
  VIMEO:        { label: 'Vimeo',        color: 'text-presence' },
  DIRECT_VIDEO: { label: 'Direct video', color: 'text-success' },
}

export function ChangeVideoModal({ open, onClose, onChanged }: ChangeVideoModalProps) {
  const { room, setRoom } = useRoomStore()
  const push = useToastStore((s) => s.push)

  const [url, setUrl] = useState(room?.currentVideoUrl ?? '')
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [detected, setDetected] = useState<string | null>(null)

  useEffect(() => {
    if (open) setUrl(room?.currentVideoUrl ?? '')
  }, [open])

  useEffect(() => {
    if (!url) { setDetected(null); return }
    const provider = detectProvider(url)
    if (provider === 'UNKNOWN') { setDetected(null); return }

    const timer = setTimeout(async () => {
      setAnalyzing(true)
      try {
        const res = await mediaService.analyze(url)
        setDetected(res.supported ? res.provider : null)
      } catch {
        setDetected(null)
      } finally {
        setAnalyzing(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [url])

  const handleSave = async () => {
    if (!room) return
    setLoading(true)
    try {
      const updated = await roomService.updateVideo(room.roomCode, { currentVideoUrl: url })
      setRoom(updated)
      push('Video updated', 'sync', 2000)
      onChanged?.()
      onClose()
    } catch {
      push('Failed to update video', 'error')
    } finally {
      setLoading(false)
    }
  }

  const meta = detected ? PROVIDER_META[detected] : null

  return (
    <Modal open={open} onClose={onClose}>
      <div className="flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-hover border border-border flex items-center justify-center text-amber text-base flex-shrink-0 mt-0.5">
            ⇄
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary tracking-tight">Change Video</h2>
            <p className="text-sm text-text-muted mt-0.5">
              All participants will be notified and synced to the new video.
            </p>
          </div>
        </div>

        {/* URL input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            New Video URL
          </label>
          <div className="relative">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className={[
                'w-full bg-void border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary',
                detected ? 'pr-28' : 'pr-10',
                'placeholder:text-text-muted',
                'outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,168,56,0.12)]',
                'transition-all duration-150',
              ].join(' ')}
            />
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
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
          <Button onClick={handleSave} loading={loading} disabled={!url.trim()} className="flex-1">
            Update Video
          </Button>
        </div>
      </div>
    </Modal>
  )
}
