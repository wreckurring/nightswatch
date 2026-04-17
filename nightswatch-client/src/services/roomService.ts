import api from '../config/api'
import type { Room, CreateRoomPayload, UpdateVideoPayload } from '../types/room'

export const roomService = {
  create: (payload: CreateRoomPayload) =>
    api.post<Room>('/rooms', payload).then((r) => r.data),

  get: (roomCode: string) =>
    api.get<Room>(`/rooms/${roomCode}`).then((r) => r.data),

  updateVideo: (roomCode: string, payload: UpdateVideoPayload) =>
    api.patch<Room>(`/rooms/${roomCode}/video`, payload).then((r) => r.data),

  deactivate: (roomCode: string) =>
    api.delete(`/rooms/${roomCode}`),

  grantPermission: (roomCode: string, userId: string) =>
    api.post<Room>(`/rooms/${roomCode}/stream-permission/${userId}`).then((r) => r.data),

  revokePermission: (roomCode: string, userId: string) =>
    api.delete<Room>(`/rooms/${roomCode}/stream-permission/${userId}`).then((r) => r.data),
}
