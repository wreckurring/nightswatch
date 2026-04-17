import { useEffect } from 'react'

interface ShortcutHandlers {
  onPlayPause: () => void
  onSeekBack: () => void    // ← 10s back
  onSeekForward: () => void // → 10s forward
  enabled: boolean
}

export function useKeyboardShortcuts({
  onPlayPause,
  onSeekBack,
  onSeekForward,
  enabled,
}: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return

    const handle = (e: KeyboardEvent) => {
      // Ignore if focus is inside an input / textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      if (e.code === 'Space') {
        e.preventDefault()
        onPlayPause()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        onSeekBack()
      } else if (e.code === 'ArrowRight') {
        e.preventDefault()
        onSeekForward()
      }
    }

    window.addEventListener('keydown', handle)
    return () => window.removeEventListener('keydown', handle)
  }, [onPlayPause, onSeekBack, onSeekForward, enabled])
}
