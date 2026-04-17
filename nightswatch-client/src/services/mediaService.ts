import api from '../config/api'
import type { AnalyzeMediaResponse } from '../types/media'

export const mediaService = {
  analyze: (url: string) =>
    api.post<AnalyzeMediaResponse>('/media/analyze', { url }).then((r) => r.data),
}
