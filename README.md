# NightsWatch

A distributed **Remote Co-Watching Application** built with microservices architecture. Real-time synchronized video playback and user presence across multiple concurrent viewing sessions.

## 🎯 Overview

NightsWatch is a modern cloud-native application that enables groups of users to watch videos together in real-time with:

- Synchronized playback (play, pause, seek)
- Live user presence tracking
- Stateless WebSocket communication
- Scalable microservice architecture

## 📦 Microservices

### 1. Room Service (`room-service`)

Manages watch room metadata, persistence, and caching.

- **Port:** 8080
- **Core Features:**
  - Room creation with unique codes
  - Video URL management
  - Room lifecycle (active/inactive)
  - Redis caching layer
  - PostgreSQL persistence
- **Technology:** Spring Boot 3.x, JPA, Redis, PostgreSQL

[→ View Room Service Docs](./room-service/README.md)

### 2. Sync Service (`sync-service`)

Handles real-time WebSocket synchronization for video playback and user presence.

- **Port:** 8081
- **Core Features:**
  - STOMP-based messaging
  - Playback synchronization (play, pause, seek, buffering)
  - User presence tracking (joined/left)
  - SockJS fallback support
  - Stateless architecture
- **Technology:** Spring Boot 3.x, WebSocket, STOMP, SockJS

[→ View Sync Service Docs](./sync-service/README.md)

## 📋 Tech Stack

| Component      | Technology               |
| -------------- | ------------------------ |
| **Language**   | Java 17+                 |
| **Framework**  | Spring Boot 3.x          |
| **Build Tool** | Maven                    |
| **Messaging**  | WebSocket, STOMP, SockJS |
| **Cache**      | Redis 6+                 |
| **Database**   | PostgreSQL 12+           |
| **API Docs**   | OpenAPI 3.0 / Swagger UI |

## 🚀 Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- PostgreSQL 12+ (for room-service)
- Redis 6+ (for room-service)

### Installation

```bash
git clone https://github.com/wreckurring/nightswatch.git
cd nightswatch
mvn clean install
```

### Run All Services

```bash
mvn spring-boot:run -pl room-service
mvn spring-boot:run -pl sync-service
```

**Services start on:**

- Room Service: `http://localhost:8080`
- Sync Service WebSocket: `ws://localhost:8081/api/ws-sync`

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                 │
│                                                     │
│  ┌──────────────┐        ┌──────────────────┐     │
│  │ REST Client  │──────▶ │  Room Service    │     │
│  └──────────────┘        │  (8080)          │     │
│         │                │                  │     │
│         │                │ - Room CRUD      │     │
│  ┌──────┴──────────┐     │ - Video URL      │     │
│  │  WebSocket      │     │ - Redis Cache    │     │
│  │  Client         │     │ - PostgreSQL     │     │
│  └──────┬──────────┘     └──────────────────┘     │
│         │                                          │
│         │       ┌──────────────────────┐          │
│         └──────▶│  Sync Service (8081) │          │
│                 │                      │          │
│                 │ - Video Sync         │          │
│                 │ - Presence Tracking  │          │
│                 │ - STOMP Messaging    │          │
│                 │ - SockJS Fallback    │          │
│                 └──────────────────────┘          │
└─────────────────────────────────────────────────────┘
```

## 📁 Monorepo Structure

```
nightswatch/
├── room-service/           (Spring Boot microservice)
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── sync-service/           (Spring Boot microservice)
│   ├── src/
│   ├── pom.xml
│   └── README.md
├── pom.xml                 (Parent POM)
└── README.md               (This file)
```

## 🧪 Testing

### Run All Tests

```bash
mvn test
```

### Run Service-Specific Tests

```bash
mvn test -pl room-service
mvn test -pl sync-service
```

## 📊 API Documentation

### Room Service Swagger UI

```
http://localhost:8080/api-docs.html
```

### Sync Service WebSocket

STOMP endpoints available at: `/ws-sync`

## 🔄 Data Flow Example

1. **User A creates room:**
   - REST: `POST /api/v1/rooms` → Room Service
   - Returns `roomCode: ABC123`

2. **User A & B connect via WebSocket:**
   - Connect to: `ws://localhost:8081/api/ws-sync`
   - Subscribe to: `/topic/room/ABC123/sync` and `/topic/room/ABC123/presence`

3. **User A plays video:**
   - Send: `SyncMessage(action=PLAY, videoTimestamp=0.0)` to `/app/room/ABC123/sync`
   - Service broadcasts to all subscribed users

4. **Users sync in real-time:**
   - All subscribers receive playback updates instantly

## 📝 Environment Configuration

### application.yml (Room Service)

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/roomdb
  redis:
    host: localhost
    port: 6379
```

### application.yml (Sync Service)

```yaml
server:
  port: 8081
spring:
  application:
    name: sync-service
```

## 🐳 Docker Support (Optional)

```bash
mvn clean package -DskipTests
docker-compose up
```

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
