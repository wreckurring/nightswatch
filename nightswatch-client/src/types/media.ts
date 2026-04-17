export type MediaProvider = 'YOUTUBE' | 'VIMEO' | 'DIRECT_VIDEO' | 'UNKNOWN'
export type MediaType = 'VIDEO' | 'STREAM' | 'UNKNOWN'

export interface AnalyzeMediaResponse {
  sourceUrl: string
  normalizedUrl: string
  provider: MediaProvider
  mediaType: MediaType
  embeddable: boolean
  supported: boolean
}
