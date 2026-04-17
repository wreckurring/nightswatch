import { create } from 'zustand'
import type { Toast, ToastVariant } from '../types/toast'

interface ToastState {
  toasts: Toast[]
  push: (message: string, variant: ToastVariant, duration?: number) => void
  dismiss: (id: string) => void
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (message, variant, duration = 3000) => {
    const id = crypto.randomUUID()
    set((state) => ({
      toasts: [...state.toasts.slice(-2), { id, message, variant, duration }],
    }))
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
      }, duration)
    }
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))
