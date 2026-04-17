import { useEffect, useRef } from 'react'
import { useRoomStore } from '../store/roomStore'
import { useToastStore } from '../store/toastStore'
import type { PresenceMessage } from '../types/sync'
import type { useSocket } from './useSocket'

type SocketHook = ReturnType<typeof useSocket>

export function usePresence(
  roomCode: string,
  socket: SocketHook,
  currentUserId: string
) {
  const { addParticipant, removeParticipant, participants } = useRoomStore()
  const participantsRef = useRef(participants)
  participantsRef.current = participants
  const push = useToastStore((s) => s.push)

  useEffect(() => {
    if (!socket.connected || !roomCode || !currentUserId) return

    const unsub = socket.subscribe(
      `/topic/room/${roomCode}/presence`,
      (body) => {
        const msg: PresenceMessage = JSON.parse(body)
        if (!msg.userId) return

        if (msg.type === 'JOINED') {
          const isNew = !participantsRef.current.find((p) => p.userId === msg.userId)
          addParticipant(msg.userId)

          if (msg.userId !== currentUserId) {
            if (isNew) {
              push(`${msg.userId} joined the room`, 'joined', 3000)
            }
            // Re-announce ourselves so the newcomer sees us in their list.
            // Only triggered for NEW joiners to prevent cascade loops.
            if (isNew) {
              socket.publish(`/app/room/${roomCode}/presence`, {
                roomCode,
                type: 'JOINED',
              })
            }
          }
        } else if (msg.type === 'LEFT') {
          removeParticipant(msg.userId)
          push(`${msg.userId} left the room`, 'left', 2500)
        }
      }
    )

    // Announce own presence
    socket.publish(`/app/room/${roomCode}/presence`, {
      roomCode,
      type: 'JOINED',
    })

    return () => {
      unsub()
      socket.publish(`/app/room/${roomCode}/presence`, {
        roomCode,
        type: 'LEFT',
      })
    }
  }, [socket.connected, roomCode])
}
