export interface Room {
  id: string
  roomCode: string
  hostId: string
  currentVideoUrl: string | null
  isActive: boolean
  streamPermissions: string[]
  createdAt: string
}

export interface Participant {
  userId: string
  online: boolean
}

export interface CreateRoomPayload {
  hostId: string
  currentVideoUrl?: string
}

export interface UpdateVideoPayload {
  currentVideoUrl: string
}
