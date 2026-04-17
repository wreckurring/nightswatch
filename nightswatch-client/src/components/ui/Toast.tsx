import { motion, AnimatePresence } from 'framer-motion'
import { useToastStore } from '../../store/toastStore'
import { cn } from '../../utils/cn'

interface ToastConfig {
  icon: string
  border: string
  iconColor: string
  glow?: string
}

const CONFIG: Record<string, ToastConfig> = {
  joined:  { icon: '●', border: 'border-l-success',    iconColor: 'text-success' },
  left:    { icon: '○', border: 'border-l-border',     iconColor: 'text-text-muted' },
  control: { icon: '⌘', border: 'border-l-amber',      iconColor: 'text-amber',    glow: 'shadow-[0_0_24px_rgba(232,168,56,0.14)]' },
  sync:    { icon: '⟳', border: 'border-l-presence',   iconColor: 'text-presence' },
  error:   { icon: '✕', border: 'border-l-danger',     iconColor: 'text-danger' },
  info:    { icon: 'ℹ', border: 'border-l-text-muted', iconColor: 'text-text-muted' },
}

const FALLBACK: ToastConfig = { icon: 'ℹ', border: 'border-l-border', iconColor: 'text-text-muted' }

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore()

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-[360px] px-4 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => {
          const cfg = CONFIG[toast.variant] ?? FALLBACK
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              onClick={() => dismiss(toast.id)}
              className={cn(
                'glass-card rounded-xl px-4 py-3 border-l-2 cursor-pointer pointer-events-auto',
                'flex items-center gap-3 select-none',
                cfg.border,
                cfg.glow,
              )}
            >
              <span className={cn('text-sm flex-shrink-0 leading-none', cfg.iconColor)}>
                {cfg.icon}
              </span>
              <p className="text-sm text-text-primary leading-snug flex-1">{toast.message}</p>
              <button
                onClick={(e) => { e.stopPropagation(); dismiss(toast.id) }}
                className="text-[10px] text-text-muted/50 hover:text-text-muted transition-colors flex-shrink-0 leading-none ml-1"
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
