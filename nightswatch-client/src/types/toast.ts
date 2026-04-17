export type ToastVariant = 'joined' | 'left' | 'control' | 'sync' | 'error' | 'info'

export interface Toast {
  id: string
  message: string
  variant: ToastVariant
  duration?: number
}
