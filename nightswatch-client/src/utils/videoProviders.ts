import type { MediaProvider } from '../types/media'

export function detectProvider(url: string): MediaProvider {
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) return 'YOUTUBE'
  if (/vimeo\.com\/\d+/.test(url)) return 'VIMEO'
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return 'DIRECT_VIDEO'
  return 'UNKNOWN'
}

export function normalizeUrl(url: string): string | null {
  // YouTube long form
  const ytLong = url.match(/youtube\.com\/watch\?v=([\w-]+)/)
  if (ytLong) return `https://www.youtube.com/embed/${ytLong[1]}?enablejsapi=1`

  // YouTube short form
  const ytShort = url.match(/youtu\.be\/([\w-]+)/)
  if (ytShort) return `https://www.youtube.com/embed/${ytShort[1]}?enablejsapi=1`

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?api=1`

  // Direct video
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) return url

  return null
}
