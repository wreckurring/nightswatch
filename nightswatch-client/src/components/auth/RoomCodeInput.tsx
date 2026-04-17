import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

interface RoomCodeInputProps {
  /** Compact mode: smaller vertical padding, used inside cards */
  compact?: boolean
}

export function RoomCodeInput({ compact }: RoomCodeInputProps) {
  const [code, setCode] = useState('')
  const navigate = useNavigate()

  const handleJoin = () => {
    const trimmed = code.trim().toUpperCase()
    if (trimmed.length === 6) navigate(`/room/${trimmed}`)
  }

  return (
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
          maxLength={6}
          placeholder="ABC123"
          className={[
            'w-full bg-void border border-border rounded-lg px-3',
            compact ? 'py-2' : 'py-2.5',
            'font-mono text-sm text-text-primary tracking-[0.25em] uppercase text-center',
            'placeholder:text-text-muted placeholder:tracking-[0.25em]',
            'outline-none focus:border-amber focus:shadow-[0_0_0_3px_rgba(232,168,56,0.12)]',
            'transition-all duration-150',
          ].join(' ')}
        />
      </div>
      <Button
        onClick={handleJoin}
        disabled={code.length < 6}
        size={compact ? 'sm' : 'md'}
        className={compact ? 'px-3' : 'px-4'}
      >
        Join →
      </Button>
    </div>
  )
}
