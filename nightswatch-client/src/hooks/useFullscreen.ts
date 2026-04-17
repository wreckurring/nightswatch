import { useEffect, useState, useCallback } from 'react'

export function useFullscreen(containerRef: React.RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const onChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  const enter = useCallback(() => {
    containerRef.current?.requestFullscreen().catch(() => {})
  }, [containerRef])

  const exit = useCallback(() => {
    document.exitFullscreen().catch(() => {})
  }, [])

  const toggle = useCallback(() => {
    isFullscreen ? exit() : enter()
  }, [isFullscreen, enter, exit])

  return { isFullscreen, toggle }
}
