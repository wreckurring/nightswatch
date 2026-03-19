# NightsWatch Sync Service

A production-ready **Spring Boot 3.x microservice** for real-time WebSocket synchronization in the NightsWatch distributed co-watching application.

## 🎯 Features

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

### Quality Assurance

- **Type-Safe DTOs**: Lombok-enhanced data transfer objects
- **Enumerated Actions**: Strongly-typed sync actions (PLAY, PAUSE, SEEK, BUFFERING)
- **Structured Messages**: JSON serialization via Jackson

## 📋 Tech Stack

| Layer          | Technology               |
| -------------- | ------------------------ |
| **Language**   | Java 17+                 |
| **Framework**  | Spring Boot 3.2.2        |
| **Build Tool** | Maven                    |
| **Messaging**  | WebSocket, STOMP, SockJS |
| **JSON**       | Jackson databind         |
| **Utilities**  | Lombok                   |
| **Testing**    | JUnit 5                  |

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+

### Installation & Run

```bash
git clone https://github.com/wreckurring/nightswatch.git
cd nightswatch

mvn clean install
mvn spring-boot:run -pl sync-service
```

**Server starts on:** `http://localhost:8081`
**WebSocket endpoint:** `ws://localhost:8081/api/ws-sync`

## 📡 WebSocket API

### Connect to Sync Service

```javascript
const socket = new SockJS("http://localhost:8081/api/ws-sync");
const stompClient = Stomp.over(socket);

stompClient.connect({}, function (frame) {
  console.log("Connected: " + frame.command);

  // Subscribe to room-specific sync messages
  stompClient.subscribe("/topic/room/ABC123/sync", function (message) {
    console.log("Sync message: " + message.body);
  });

  // Subscribe to presence messages
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

## 🔄 STOMP Message Flow

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

## 📊 API Documentation

WebSocket STOMP endpoints are self-documenting. Use any STOMP client (JavaScript, Java, Python) to connect.

**Available Endpoints:**

- `POST /app/room/{roomCode}/sync` → `/topic/room/{roomCode}/sync`
- `POST /app/room/{roomCode}/presence` → `/topic/room/{roomCode}/presence`

## 🧪 Testing

### Run All Tests

```bash
mvn test
```

**Test Database:** In-memory (no external dependencies required)

## ⚙️ Configuration

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

## 📁 Project Structure

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

## 🔄 Architecture Pattern

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

## 🔒 Exception Handling

All exceptions are logged and gracefully handled by Spring Framework. WebSocket connections are resilient with automatic reconnection support via SockJS.

## 🌐 CORS & Security

**Current Configuration:**

```java
setAllowedOriginPatterns("*")  // Development mode
```

**For Production:**
Replace with specific allowed origins:

```java
setAllowedOrigins("https://yourdomain.com")
```

## 🚀 Scalability

This service is **stateless** and can be scaled horizontally:

- Multiple instances can run in parallel
- Load balance WebSocket connections across instances
- Message broker is configured per instance (in production, use external broker like RabbitMQ or Apache ActiveMQ)

**Future Enhancement:**
Replace `enableSimpleBroker()` with `enableStompBrokerRelay()` for distributed deployments:

```java
config.enableStompBrokerRelay("/topic")
    .setRelayHost("rabbitmq-host")
    .setRelayPort(61613);
```

## 🐳 Docker Support (Optional)

Build Docker image:

```bash
mvn clean package -DskipTests
docker build -t nightswatch-sync-service:1.0 .
docker run -p 8081:8081 nightswatch-sync-service:1.0
```

## 📝 Commit History

| Commit  | Message                                                                                     |
| ------- | ------------------------------------------------------------------------------------------- |
| 0d15b69 | Phase 3-7: Add WebSocket config, event listener, VideoSyncController, and application setup |
| eb0e785 | Phase 1-2: Add pom.xml and DTOs (SyncMessage, PresenceMessage, enums)                       |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit changes (`git commit -am 'feat: add feature'`)
4. Push to branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## 📄 License

MIT License - See LICENSE file for details

## 👨‍💻 Author

**NightsWatch Development Team**

## 📧 Support

For issues or questions, please open a GitHub issue.

---

**Built with ❤️ for remote co-watching experiences**
