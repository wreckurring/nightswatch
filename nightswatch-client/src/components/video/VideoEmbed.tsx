import { forwardRef } from 'react'
import { normalizeUrl, detectProvider } from '../../utils/videoProviders'

interface VideoEmbedProps {
  url: string
  className?: string
  onLoad?: () => void
}

export const VideoEmbed = forwardRef<HTMLIFrameElement | HTMLVideoElement, VideoEmbedProps>(
  ({ url, className, onLoad }, ref) => {
    const provider = detectProvider(url)
    const normalized = normalizeUrl(url)

    if (!normalized) {
      return (
        <div className={`flex items-center justify-center text-text-muted text-sm bg-surface ${className}`}>
          Unsupported video URL
        </div>
      )
    }

    if (provider === 'DIRECT_VIDEO') {
      return (
        <video
          ref={ref as React.Ref<HTMLVideoElement>}
          src={normalized}
          className={className}
          onLoadedMetadata={onLoad}
          playsInline
        />
      )
    }

    return (
      <iframe
        ref={ref as React.Ref<HTMLIFrameElement>}
        src={normalized}
        className={className}
        onLoad={onLoad}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        title="NightsWatch Video"
        frameBorder="0"
      />
    )
  }
)

VideoEmbed.displayName = 'VideoEmbed'
