import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Avatar } from '../components/ui/Avatar'
import { CreateRoomModal } from '../components/room/CreateRoomModal'
import { RoomCodeInput } from '../components/auth/RoomCodeInput'
import { useAuth } from '../hooks/useAuth'

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

function getGreeting() {
  const h = new Date().getHours()
  if (h < 5)  return 'Still up?'
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  if (h < 21) return 'Good evening'
  return 'Movie night?'
}

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.07 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' as const } },
  },
}

export function LobbyPage() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) navigate('/')
  }, [isAuthenticated])

  if (!user) return null

  return (
    <div className="min-h-screen bg-void flex flex-col">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-amber-hero" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: NOISE_SVG, backgroundRepeat: 'repeat', backgroundSize: '128px' }}
        />
      </div>

      {/* Top bar */}
      <nav className="relative z-10 flex items-center justify-between px-5 sm:px-8 h-14 border-b border-border/50 bg-void/40 backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <span className="text-amber text-lg">◈</span>
          <span className="font-semibold text-text-primary tracking-tight">NightsWatch</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-elevated border border-border">
            <Avatar userId={user.username} size="sm" />
            <span className="text-sm text-text-secondary font-medium">{user.username}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs text-text-muted hover:text-text-secondary transition-colors px-3 py-1.5 rounded-lg hover:bg-hover"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-4 py-10 sm:py-14">
        <motion.div
          variants={stagger.container}
          initial="initial"
          animate="animate"
          className="w-full max-w-lg flex flex-col gap-6"
        >

          {/* Greeting */}
          <motion.div variants={stagger.item} className="flex items-center gap-3">
            <Avatar userId={user.username} size="md" online />
            <div>
              <h1 className="text-xl font-semibold text-text-primary tracking-tight">
                {getGreeting()}, {user.username}.
              </h1>
              <p className="text-sm text-text-muted">Start a watch party or join one.</p>
            </div>
          </motion.div>

          {/* Action cards */}
          <motion.div variants={stagger.item} className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            {/* Create room card */}
            <button
              onClick={() => setModalOpen(true)}
              className="group relative flex flex-col gap-3 p-5 rounded-xl bg-elevated border border-border hover:border-amber/40 hover:bg-elevated/80 transition-all duration-200 text-left overflow-hidden"
            >
              {/* Amber glow on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(232,168,56,0.06) 0%, transparent 70%)' }}
              />
              <div className="relative w-9 h-9 rounded-lg bg-amber/15 border border-amber/25 flex items-center justify-center text-amber text-base">
                ＋
              </div>
              <div className="relative">
                <div className="text-sm font-semibold text-text-primary mb-0.5">Create a Room</div>
                <div className="text-xs text-text-muted leading-relaxed">
                  Host a watch party. Paste a YouTube or Vimeo link and invite friends.
                </div>
              </div>
              <div className="relative flex items-center gap-1 text-xs text-amber font-medium mt-auto">
                Get started
                <span className="transition-transform duration-150 group-hover:translate-x-0.5">→</span>
              </div>
            </button>

            {/* Join room card */}
            <div className="flex flex-col gap-3 p-5 rounded-xl bg-elevated border border-border">
              <div className="w-9 h-9 rounded-lg bg-presence/10 border border-presence/20 flex items-center justify-center text-presence text-base">
                ⇥
              </div>
              <div>
                <div className="text-sm font-semibold text-text-primary mb-0.5">Join a Room</div>
                <div className="text-xs text-text-muted leading-relaxed mb-3">
                  Have a room code? Enter it below to jump right in.
                </div>
                <RoomCodeInput compact />
              </div>
            </div>
          </motion.div>

          {/* How it works strip */}
          <motion.div variants={stagger.item}>
            <div className="rounded-xl border border-border bg-elevated/50 overflow-hidden">
              <div className="px-5 py-3 border-b border-border">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">
                  How it works
                </span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border">
                {[
                  { step: '1', icon: '◈', title: 'Create', desc: 'Open a room and paste a video link' },
                  { step: '2', icon: '⇄', title: 'Invite', desc: 'Share the 6-character room code' },
                  { step: '3', icon: '▶', title: 'Watch', desc: 'Play, pause and seek in perfect sync' },
                ].map((s) => (
                  <div key={s.step} className="flex flex-col items-center gap-2 px-4 py-5 text-center">
                    <div className="w-8 h-8 rounded-full bg-hover border border-border flex items-center justify-center text-amber text-xs">
                      {s.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-text-primary">{s.title}</div>
                      <div className="text-[11px] text-text-muted leading-snug mt-0.5">{s.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Footer note */}
          <motion.p variants={stagger.item} className="text-center text-xs text-text-muted">
            Supports YouTube, Vimeo, and direct video links.
          </motion.p>
        </motion.div>
      </main>

      <CreateRoomModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
