# NightsWatch

A distributed remote co-watching application built with Spring Boot microservices for authentication, room management, and real-time synchronized playback.

## Services

### 1. API Gateway (`api-gateway`)

Client-facing edge service built with Spring Cloud Gateway.

- Port: `8082`
- Responsibility: public ingress, route forwarding, future auth and edge policies

[View API Gateway Docs](./api-gateway/README.md)

### 2. Auth Service (`auth-service`)

JWT authentication service for user registration, login, and token validation.

- Port: `8083`
- Technology: Spring Boot, Spring Security, JPA, PostgreSQL, JWT

[View Auth Service Docs](./auth-service/README.md)

### 3. Room Service (`room-service`)

Owns room lifecycle, room metadata, persistence, and cache-backed reads.

- Port: `8080`
- Technology: Spring Boot, JPA, Redis, PostgreSQL

[View Room Service Docs](./room-service/README.md)

### 4. Sync Service (`sync-service`)

Owns live playback synchronization and room presence over WebSocket/STOMP.

- Port: `8081`
- Technology: Spring Boot, WebSocket, STOMP, SockJS

[View Sync Service Docs](./sync-service/README.md)

### 5. Media Service (`media-service`)

URL analysis, provider detection, and media asset persistence.

- Port: `8084`
- Technology: Spring Boot, JPA, PostgreSQL
- Supports: YouTube, Vimeo, direct video files (`.mp4`, `.webm`, etc.)

[View Media Service Docs](./media-service/README.md)

## Recommended Boundaries

The current split should stay narrow:

- `api-gateway`: single public entry point, routing, gateway filters, future rate limiting and auth integration
- `auth-service`: authentication, credential validation, JWT lifecycle
- `room-service`: room CRUD, room settings, active status, persistence, cache
- `sync-service`: playback events, presence updates, WebSocket session traffic
- `media-service`: URL analysis, provider normalization, media asset registry

As NightsWatch grows, add new concerns as separate services instead of expanding the existing ones:

- `user-service`: profiles, preferences, social graph
- `notification-service`: invites, reminders, async event delivery
- `analytics-service`: telemetry, product metrics, reporting

## Quick Start

```bash
git clone https://github.com/wreckurring/nightswatch.git
cd nightswatch
mvn clean install
```

Run each service in a separate terminal:

```bash
mvn spring-boot:run -pl auth-service
mvn spring-boot:run -pl room-service
mvn spring-boot:run -pl sync-service
mvn spring-boot:run -pl media-service
mvn spring-boot:run -pl api-gateway
```

## Public Endpoints

Use the gateway as the main client entry point:

- Auth API: `http://localhost:8082/api/v1/auth`
- Auth Swagger UI: `http://localhost:8082/auth-docs.html`
- Room API: `http://localhost:8082/api/v1/rooms`
- Room Swagger UI: `http://localhost:8082/api-docs.html`
- Room OpenAPI: `http://localhost:8082/v3/api-docs`
- Sync SockJS and WebSocket: `http://localhost:8082/api/ws-sync`
- Media API: `http://localhost:8082/api/v1/media`

Direct service ports still work for local development:

- Auth Service: `http://localhost:8083`
- Room Service: `http://localhost:8080`
- Sync Service: `http://localhost:8081`
- Media Service: `http://localhost:8084`

## Architecture

```text
+-------------------+        +---------------------+
| Client (Browser)  | -----> | API Gateway (8082)  |
+-------------------+        +----------+----------+
                                         |
                        +----------------+----------------+------------------+
                        |                |                |                  |
                        v                v                v                  v
                +---------------+ +---------------+ +---------------+ +---------------+
                | Auth Service  | | Room Service  | | Sync Service  | | Media Service |
                |     8083      | |     8080      | |     8081      | |     8084      |
                | JWT + Users   | | REST + DB     | | WS + STOMP    | | URLs + Assets |
                +---------------+ +---------------+ +---------------+ +---------------+
```

## Example Flow

1. A client authenticates through `POST /api/v1/auth/login` on the gateway and receives a JWT.
2. A client analyzes a video URL through `POST /api/v1/media/analyze` to validate and normalize it.
3. A client creates a room through `POST /api/v1/rooms` on the gateway.
4. The gateway forwards auth requests to `auth-service`, room requests to `room-service`, and media requests to `media-service`.
5. Clients connect to `/api/ws-sync` on the gateway for live sync traffic.
6. The gateway forwards SockJS and WebSocket traffic to `sync-service`.

## Monorepo Structure

```text
nightswatch/
|-- api-gateway/
|   |-- src/
|   |-- pom.xml
|   `-- README.md
|-- auth-service/
|   |-- src/
|   |-- pom.xml
|   `-- README.md
|-- room-service/
|   |-- src/
|   |-- pom.xml
|   `-- README.md
|-- sync-service/
|   |-- src/
|   |-- pom.xml
|   `-- README.md
|-- media-service/
|   |-- src/
|   |-- pom.xml
|   `-- README.md
|-- pom.xml
`-- README.md
```

## Testing

```bash
mvn test
```
