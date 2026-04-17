import { create } from 'zustand'
import type { Room, Participant } from '../types/room'

interface RoomState {
  room: Room | null
  participants: Participant[]
  setRoom: (room: Room) => void
  clearRoom: () => void
  addParticipant: (userId: string) => void
  removeParticipant: (userId: string) => void
  setStreamPermissions: (permissions: string[]) => void
}

export const useRoomStore = create<RoomState>((set) => ({
  room: null,
  participants: [],
  setRoom: (room) => set({ room }),
  clearRoom: () => set({ room: null, participants: [] }),
  addParticipant: (userId) =>
    set((state) => {
      if (state.participants.find((p) => p.userId === userId)) return state
      return { participants: [...state.participants, { userId, online: true }] }
    }),
  removeParticipant: (userId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.userId !== userId),
    })),
  setStreamPermissions: (permissions) =>
    set((state) =>
      state.room ? { room: { ...state.room, streamPermissions: permissions } } : state
    ),
}))
