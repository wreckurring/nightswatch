# NightsWatch Sync Service

A production-ready **Spring Boot microservice** for real-time WebSocket synchronization in the NightsWatch distributed co-watching application.

## Features

### Core Functionality

- **Playback Synchronization**: Real-time sync of play, pause, seek, and buffering events
- **User Presence Tracking**: Track when users join and leave viewing sessions
- **STOMP Messaging**: Industry-standard protocol for real-time messaging
- **SockJS Fallback**: Graceful degradation for browsers without WebSocket support
- **Room-Scoped Channels**: Isolated message routing per watch room

### Infrastructure & Performance

- **Stateless Architecture**: Horizontally scalable, no session affinity required
- **WebSocket Event Logging**: Tracks user connections and disconnections
- **Message Routing**: Client-to-server route via `/app` prefix, broadcasts via `/topic` prefix
- **Zero Database Dependency**: Pure in-memory real-time messaging

## Tech Stack

| Layer          | Technology               |
| -------------- | ------------------------ |
| **Language**   | Java 17+                 |
| **Framework**  | Spring Boot 3.2.2        |
| **Build Tool** | Maven                    |
| **Messaging**  | WebSocket, STOMP, SockJS |
| **JSON**       | Jackson databind         |
| **Utilities**  | Lombok                   |
| **Testing**    | JUnit 5                  |

## Quick Start

### Installation & Run

```bash
git clone https://github.com/wreckurring/nightswatch.git
cd nightswatch

mvn clean install
mvn spring-boot:run -pl sync-service
```

**Server starts on:** `http://localhost:8081`
**WebSocket endpoint:** `ws://localhost:8081/api/ws-sync`

## WebSocket API

### Connect to Sync Service

```javascript
const socket = new SockJS("http://localhost:8081/api/ws-sync");
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
  console.log("Connected: " + frame.command);

  stompClient.subscribe("/topic/room/ABC123/sync", function (message) {
    console.log("Sync message: " + message.body);
  });

  stompClient.subscribe("/topic/room/ABC123/presence", function (message) {
    console.log("Presence: " + message.body);
  });
});
```

### Endpoint 1: Playback Synchronized

Send playback sync messages to `/app/room/{roomCode}/sync`

**Request (JSON):**

```json
{
  "roomCode": "ABC123",
  "userId": "user456",
  "action": "PLAY",
  "videoTimestamp": 45.5
}
```

**Broadcast Destination:** `/topic/room/ABC123/sync`

**Actions Enum:**

- `PLAY` — Start video playback
- `PAUSE` — Pause video playback
- `SEEK` — Jump to specific timestamp
- `BUFFERING` — Indicate buffering state

### Endpoint 2: User Presence

Send presence messages to `/app/room/{roomCode}/presence`

**Request (JSON):**

```json
{
  "roomCode": "ABC123",
  "userId": "user456",
  "type": "JOINED"
}
```

**Broadcast Destination:** `/topic/room/ABC123/presence`

**Type Enum:**

- `JOINED` — User entered the room
- `LEFT` — User left the room

## STOMP Message Flow

```
Client                          Sync Service                 Broadcast
  │                                  │                           │
  ├──────────────────────────────────►                           │
  │  SEND to /app/room/ABC123/sync   │                           │
  │  (SyncMessage payload)            │                           │
  │                                  ├──────────────────────────►│
  │                                  │  Broadcast to              │
  │                                  │  /topic/room/ABC123/sync   │
  │                                  │                           │
  │◄──────────────────────────────────────────────────────────────┤
  │  MESSAGE from /topic/.../sync     │   (All subscribers)       │
  │                                  │                           │
```

## Configuration

### application.yml (Production)

```yaml
spring:
  application:
    name: sync-service

server:
  port: 8081
  servlet:
    context-path: /api

logging:
  level:
    root: INFO
    com.nightswatch.syncservice: DEBUG
```

## Project Structure

```
nightswatch/sync-service/
├── src/
│   ├── main/
│   │   ├── java/com/nightswatch/syncservice/
│   │   │   ├── SyncServiceApplication.java       (Boot entry point)
│   │   │   ├── config/
│   │   │   │   └── WebSocketConfig.java          (STOMP, SockJS, broker config)
│   │   │   ├── dto/
│   │   │   │   ├── SyncAction.java               (Enum: PLAY, PAUSE, SEEK, BUFFERING)
│   │   │   │   ├── SyncMessage.java              (DTO: roomCode, userId, action, timestamp)
│   │   │   │   ├── PresenceType.java             (Enum: JOINED, LEFT)
│   │   │   │   └── PresenceMessage.java          (DTO: roomCode, userId, type)
│   │   │   ├── controller/
│   │   │   │   └── VideoSyncController.java      (STOMP endpoints)
│   │   │   └── listener/
│   │   │       └── WebSocketEventListener.java   (Connection/disconnection logging)
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── java/com/nightswatch/syncservice/
│       └── resources/
├── pom.xml
└── README.md
```

## Architecture Pattern

**Stateless Event-Driven Architecture**

```
WebSocket Client
    ↓
STOMP Frame
    ↓
VideoSyncController (@MessageMapping)
    ↓
Message Broker (in-memory)
    ↓
All Subscribed Clients → Broadcast
```

## Scalability

This service is **stateless** and can be scaled horizontally:

- Multiple instances can run in parallel
- Load balance WebSocket connections across instances
- Message broker is configurable per deployment

### Single-Instance Mode (Development)

**Default configuration** uses in-memory SimpleBroker:

```yaml
sync-service:
  broker:
    type: simple
```

### Distributed Mode (Production)

For distributing messages across multiple instances, configure STOMP Broker Relay with RabbitMQ:

```yaml
sync-service:
  broker:
    type: relay
    relay-host: rabbitmq.example.com
    relay-port: 61613
    relay-login: guest
    relay-password: guest
```

**Prerequisites:** RabbitMQ with STOMP plugin enabled (default port 61613)

### Docker Compose Example

```yaml
version: "3.8"
services:
  rabbitmq:
    image: rabbitmq:3.12-management
    ports:
      - "5672:5672"
      - "61613:61613"
      - "15672:15672"
    command: bash -c "rabbitmq-plugins enable rabbitmq_stomp && rabbitmq-server"

  sync-service-1:
    image: nightswatch-sync-service:latest
    ports:
      - "8081:8081"
    environment:
      SYNC_SERVICE_BROKER_TYPE: relay
      SYNC_SERVICE_BROKER_RELAY_HOST: rabbitmq

  sync-service-2:
    image: nightswatch-sync-service:latest
    ports:
      - "8082:8081"
    environment:
      SYNC_SERVICE_BROKER_TYPE: relay
      SYNC_SERVICE_BROKER_RELAY_HOST: rabbitmq
    depends_on:
      - rabbitmq
```

### Architecture Diagram

```
Client 1 ──┐
Client 2 ──┼──────► Load Balancer ──┬──────► Instance 1 (8081)
Client 3 ──┤                        │
Client 4 ──┤                        ├──────► Instance 2 (8082)
           │                        │
           └──────────────────────┬─┴──────► Instance N
                                  │
                        STOMP Broker Relay
                                  │
                              RabbitMQ
                           (STOMP: 61613)
```

## License

MIT License

---

**Built with ❤️ and </> by MkR**
