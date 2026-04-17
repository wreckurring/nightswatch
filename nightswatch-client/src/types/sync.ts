export type SyncAction = 'PLAY' | 'PAUSE' | 'SEEK' | 'BUFFERING'
export type PresenceType = 'JOINED' | 'LEFT'

export interface SyncMessage {
  roomCode: string
  userId?: string
  action: SyncAction
  videoTimestamp: number
}

export interface PresenceMessage {
  roomCode: string
  userId?: string
  type: PresenceType
}
