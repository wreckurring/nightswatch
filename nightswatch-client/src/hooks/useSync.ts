import { useEffect, useState } from 'react'
import type { SyncMessage } from '../types/sync'
import type { useSocket } from './useSocket'

type SocketHook = ReturnType<typeof useSocket>
export type SyncStatus = 'LIVE' | 'SYNCING' | 'BUFFERING' | 'DISCONNECTED'

interface UseSyncOptions {
  roomCode: string
  socket: SocketHook
  isController: boolean
  onReceive: (msg: SyncMessage) => void
}

export function useSync({ roomCode, socket, isController, onReceive }: UseSyncOptions) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('DISCONNECTED')
  const [flashSync, setFlashSync] = useState(false)

  useEffect(() => {
    setSyncStatus(socket.connected ? 'LIVE' : 'DISCONNECTED')
  }, [socket.connected])

  useEffect(() => {
    if (!socket.connected || !roomCode) return

    const unsub = socket.subscribe(`/topic/room/${roomCode}/sync`, (body) => {
      const msg: SyncMessage = JSON.parse(body)

      // Controllers drive — but still update their own UI on echo
      if (!isController) {
        setSyncStatus('SYNCING')
        setFlashSync(true)
        setTimeout(() => setFlashSync(false), 700)
        setTimeout(() => setSyncStatus('LIVE'), 1500)
      }

      onReceive(msg)
    })

    return unsub
  }, [socket.connected, roomCode, isController, onReceive])

  const sendSync = (action: SyncMessage['action'], videoTimestamp: number) => {
    if (!isController || !socket.connected) return
    socket.publish(`/app/room/${roomCode}/sync`, { roomCode, action, videoTimestamp })
  }

  return { syncStatus, flashSync, sendSync }
}
