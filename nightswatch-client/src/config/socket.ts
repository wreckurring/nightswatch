import { Client } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

let stompClient: Client | null = null

export function createStompClient(token: string): Client {
  const client = new Client({
    webSocketFactory: () =>
      new SockJS(`${import.meta.env.VITE_WS_URL}?token=${token}`),
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
  })
  return client
}

export function getStompClient(): Client | null {
  return stompClient
}

export function setStompClient(client: Client | null) {
  stompClient = client
}
