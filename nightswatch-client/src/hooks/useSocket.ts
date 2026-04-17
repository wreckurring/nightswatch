import { useEffect, useRef, useState } from 'react'
import { Client, type StompSubscription } from '@stomp/stompjs'
import SockJS from 'sockjs-client'

export function useSocket(token: string | null) {
  const clientRef = useRef<Client | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!token) return

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_WS_URL}?token=${token}`),
      reconnectDelay: 5000,
      onConnect: () => setConnected(true),
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.warn('STOMP error', frame)
        setConnected(false)
      },
    })

    client.activate()
    clientRef.current = client

    return () => {
      client.deactivate()
      clientRef.current = null
      setConnected(false)
    }
  }, [token])

  const subscribe = (
    destination: string,
    callback: (body: string) => void
  ): (() => void) => {
    const client = clientRef.current
    if (!client?.connected) return () => {}
    const sub: StompSubscription = client.subscribe(destination, (msg) =>
      callback(msg.body)
    )
    return () => sub.unsubscribe()
  }

  const publish = (destination: string, body: object) => {
    if (!clientRef.current?.connected) return
    clientRef.current.publish({
      destination,
      body: JSON.stringify(body),
    })
  }

  return { connected, subscribe, publish, clientRef }
}
