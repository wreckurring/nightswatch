# NightsWatch

A distributed **Remote Co-Watching Application** built with microservices architecture. Real-time synchronized video playback and user presence across multiple concurrent viewing sessions.

## Microservices

### 1. Room Service (`room-service`)

Manages watch room metadata, persistence, and caching.

- **Port:** 8080
- **Technology:** Spring Boot, JPA, Redis, PostgreSQL

[→ View Room Service Docs](./room-service/README.md)

### 2. Sync Service (`sync-service`)

Handles real-time WebSocket synchronization for video playback and user presence.

- **Port:** 8081
- **Technology:** Spring Boot, WebSocket, STOMP, SockJS

[→ View Sync Service Docs](./sync-service/README.md)

## Tech Stack

| Component      | Technology               |
| -------------- | ------------------------ |
| **Language**   | Java                     |
| **Framework**  | Spring Boot              |
| **Messaging**  | WebSocket, STOMP, SockJS |
| **Cache**      | Redis                    |
| **Database**   | PostgreSQL               |

## Quick Start

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

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                 │
│                                                     │
│  ┌──────────────┐        ┌──────────────────┐       │
│  │ REST Client  │──────> │  Room Service    │       │
│  └──────────────┘        │  (8080)          │       │
│         │                │                  │       │
│         │                │ - Room CRUD      │       │
│  ┌──────┴──────────┐     │ - Video URL      │       │
│  │  WebSocket      │     │ - Redis Cache    │       │
│  │  Client         │     │ - PostgreSQL     │       │
│  └──────┬──────────┘     └──────────────────┘       │
│         │                                           │
│         │       ┌──────────────────────┐            │
│         └──────>│  Sync Service (8081) │            │
│                 │                      │            │
│                 │ - Video Sync         │            │
│                 │ - Presence Tracking  │            │
│                 │ - STOMP Messaging    │            │
│                 │ - SockJS Fallback    │            │
│                 └──────────────────────┘            │
└─────────────────────────────────────────────────────┘
```

## Monorepo Structure

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
└── README.md
```

## Testing

### Run All Tests

```bash
mvn test
```

### Run Service-Specific Tests

```bash
mvn test -pl room-service
mvn test -pl sync-service
```

## API Documentation

### Room Service Swagger UI

```
http://localhost:8080/api-docs.html
```

### Sync Service WebSocket

STOMP endpoints available at: `/ws-sync`

## Data Flow Example

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

## Environment Configuration

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

## License

MIT License

---

**Built with ❤️ & </> by MkR.**
