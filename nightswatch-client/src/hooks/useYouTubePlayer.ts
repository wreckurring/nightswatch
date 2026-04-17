import { useEffect, useState, useCallback } from 'react'

interface PlayerState {
  currentTime: number
  duration: number
  isPlaying: boolean
  ready: boolean
}

// YouTube IFrame player state constants
const YT_PLAYING = 1
const YT_PAUSED = 2
const YT_ENDED = 0

export function useYouTubePlayer(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const [state, setState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    ready: false,
  })

  const postCommand = useCallback(
    (func: string, args: unknown[] = []) => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      )
    },
    [iframeRef]
  )

  // Subscribe to YouTube events by sending a "listening" handshake
  const initYT = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    // Tell YouTube we want to receive events
    win.postMessage(JSON.stringify({ event: 'listening', id: 1, channel: 'widget' }), '*')
  }, [iframeRef])

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      // Only handle messages from the YouTube iframe
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return

      let data: Record<string, unknown>
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch {
        return
      }

      const event = data.event as string | undefined

      if (event === 'onReady' || event === 'initialDelivery') {
        setState((s) => ({ ...s, ready: true }))
      }

      if (event === 'onStateChange') {
        const ytState = data.info as number
        if (ytState === YT_PLAYING) setState((s) => ({ ...s, isPlaying: true }))
        else if (ytState === YT_PAUSED || ytState === YT_ENDED)
          setState((s) => ({ ...s, isPlaying: false }))
      }

      // infoDelivery fires ~250ms when playing — gives us currentTime + duration
      if (event === 'infoDelivery') {
        const info = data.info as Record<string, number> | null
        if (!info) return
        setState((s) => ({
          ...s,
          currentTime: info.currentTime ?? s.currentTime,
          duration: info.duration ?? s.duration,
          isPlaying:
            typeof info.playerState === 'number'
              ? info.playerState === YT_PLAYING
              : s.isPlaying,
        }))
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [iframeRef, initYT])

  const play = useCallback(() => postCommand('playVideo'), [postCommand])
  const pause = useCallback(() => postCommand('pauseVideo'), [postCommand])
  const seekTo = useCallback(
    (seconds: number) => postCommand('seekTo', [seconds, true]),
    [postCommand]
  )

  // Called when the iframe element fires its load event
  const onIframeLoad = useCallback(() => {
    // Small delay to ensure YouTube's JS is ready before handshake
    setTimeout(initYT, 300)
  }, [initYT])

  return { ...state, play, pause, seekTo, onIframeLoad }
}

// ─── Vimeo ────────────────────────────────────────────────────────────────────

export function useVimeoPlayer(iframeRef: React.RefObject<HTMLIFrameElement | null>) {
  const [state, setState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    ready: false,
  })

  const post = useCallback(
    (method: string, value?: unknown) => {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ method, value }),
        '*'
      )
    },
    [iframeRef]
  )

  useEffect(() => {
    const handle = (e: MessageEvent) => {
      if (iframeRef.current && e.source !== iframeRef.current.contentWindow) return
      let data: Record<string, unknown>
      try {
        data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data
      } catch {
        return
      }
      if (data.event === 'ready') setState((s) => ({ ...s, ready: true }))
      if (data.event === 'play') setState((s) => ({ ...s, isPlaying: true }))
      if (data.event === 'pause' || data.event === 'ended')
        setState((s) => ({ ...s, isPlaying: false }))
      if (data.event === 'timeupdate') {
        const d = data.data as Record<string, number>
        setState((s) => ({ ...s, currentTime: d?.seconds ?? s.currentTime, duration: d?.duration ?? s.duration }))
      }
    }
    window.addEventListener('message', handle)
    return () => window.removeEventListener('message', handle)
  }, [iframeRef])

  const onIframeLoad = useCallback(() => {
    setTimeout(() => {
      post('addEventListener', 'play')
      post('addEventListener', 'pause')
      post('addEventListener', 'ended')
      post('addEventListener', 'timeupdate')
    }, 300)
  }, [post])

  const play = useCallback(() => post('play'), [post])
  const pause = useCallback(() => post('pause'), [post])
  const seekTo = useCallback((s: number) => post('setCurrentTime', s), [post])

  return { ...state, play, pause, seekTo, onIframeLoad }
}

// ─── Native <video> ───────────────────────────────────────────────────────────

export function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [state, setState] = useState<PlayerState>({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    ready: false,
  })

  useEffect(() => {
    const el = videoRef.current
    if (!el) return
    const onLoaded = () => setState((s) => ({ ...s, duration: el.duration, ready: true }))
    const onTimeUpdate = () => setState((s) => ({ ...s, currentTime: el.currentTime }))
    const onPlay = () => setState((s) => ({ ...s, isPlaying: true }))
    const onPause = () => setState((s) => ({ ...s, isPlaying: false }))
    el.addEventListener('loadedmetadata', onLoaded)
    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('play', onPlay)
    el.addEventListener('pause', onPause)
    return () => {
      el.removeEventListener('loadedmetadata', onLoaded)
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('play', onPlay)
      el.removeEventListener('pause', onPause)
    }
  }, [videoRef])

  const play = useCallback(() => { videoRef.current?.play() }, [videoRef])
  const pause = useCallback(() => { videoRef.current?.pause() }, [videoRef])
  const seekTo = useCallback(
    (s: number) => { if (videoRef.current) videoRef.current.currentTime = s },
    [videoRef]
  )
  const onIframeLoad = useCallback(() => {}, [])

  return { ...state, play, pause, seekTo, onIframeLoad }
}
