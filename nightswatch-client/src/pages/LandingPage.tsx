import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { LoginForm } from '../components/auth/LoginForm'
import { RegisterForm } from '../components/auth/RegisterForm'
import { RoomCodeInput } from '../components/auth/RoomCodeInput'
import { useAuthStore } from '../store/authStore'

type Tab = 'login' | 'register'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

const FEATURES = [
  { icon: '⟳', label: 'Frame-perfect sync' },
  { icon: '▶', label: 'YouTube & Vimeo' },
  { icon: '●', label: 'Real-time presence' },
  { icon: '⌘', label: 'Shared control' },
]

export function LandingPage() {
  const [tab, setTab] = useState<Tab>('login')
  const { user } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (user) navigate('/lobby', { replace: true })
  }, [user])

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-amber-hero" />
        {/* Secondary subtle blue glow bottom-right */}
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] opacity-[0.04]"
          style={{
            background: 'radial-gradient(circle at 100% 100%, #3B82F6 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: NOISE_SVG, backgroundRepeat: 'repeat', backgroundSize: '128px' }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 sm:px-10 h-16">
        <div className="flex items-center gap-2.5">
          <span className="text-amber text-xl leading-none">◈</span>
          <span className="font-semibold text-text-primary tracking-tight text-lg">NightsWatch</span>
        </div>
        <div className="hidden sm:flex items-center gap-1">
          {(['login', 'register'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={[
                'text-sm px-3 py-1.5 rounded-lg transition-all duration-150',
                tab === t
                  ? 'text-text-primary bg-hover'
                  : 'text-text-muted hover:text-text-secondary',
              ].join(' ')}
            >
              {t === 'login' ? 'Sign in' : 'Register'}
            </button>
          ))}
        </div>
      </nav>

      {/* Main */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10 gap-8">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-xl"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-amber/10 border border-amber/20 text-amber text-xs font-medium px-3 py-1 rounded-full mb-5 tracking-wide">
            <span className="w-1.5 h-1.5 rounded-full bg-amber animate-live-pulse" />
            Watch parties, synchronized
          </div>

          <h1 className="text-5xl sm:text-6xl font-semibold text-text-primary tracking-[-0.03em] leading-[1.05] mb-4">
            Watch Together,<br />
            <span className="text-amber">Perfectly in Sync.</span>
          </h1>
          <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-md mx-auto">
            Host a room, invite friends, and experience YouTube or Vimeo videos frame-perfectly synchronized — anywhere in the world.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {FEATURES.map((f) => (
              <span
                key={f.label}
                className="inline-flex items-center gap-1.5 bg-elevated border border-border text-text-secondary text-xs px-3 py-1.5 rounded-full"
              >
                <span className="text-amber text-[11px]">{f.icon}</span>
                {f.label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Auth card */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-sm"
        >
          <div className="glass-card rounded-2xl p-1 flex flex-col">

            {/* Tab switcher */}
            <div className="flex bg-void/60 rounded-xl p-1 gap-1 mb-1">
              {(['login', 'register'] as Tab[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    'flex-1 text-sm font-medium py-2 rounded-lg transition-all duration-200',
                    tab === t
                      ? 'bg-elevated text-text-primary shadow-sm'
                      : 'text-text-muted hover:text-text-secondary',
                  ].join(' ')}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div className="px-4 pb-4 pt-2 flex flex-col gap-5">
              {/* Auth forms */}
              <AnimatePresence mode="wait">
                {tab === 'login'
                  ? <LoginForm key="login" />
                  : <RegisterForm key="register" />
                }
              </AnimatePresence>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-text-muted">or join with a code</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <RoomCodeInput />
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center gap-6 h-14 text-xs text-text-muted border-t border-border/30">
        <span>© 2026 NightsWatch</span>
        <span className="w-px h-3 bg-border" />
        <span>Built for movie nights</span>
      </footer>
    </div>
  )
}
