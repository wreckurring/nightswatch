# NightsWatch

A distributed remote co-watching application built with Spring Boot microservices for room management and real-time synchronized playback.

## Services

### 1. API Gateway (`api-gateway`)

Client-facing edge service built with Spring Cloud Gateway.

- Port: `8082`
- Responsibility: public ingress, route forwarding, future auth and edge policies

[View API Gateway Docs](./api-gateway/README.md)

### 2. Room Service (`room-service`)

Owns room lifecycle, room metadata, persistence, and cache-backed reads.

- Port: `8080`
- Technology: Spring Boot, JPA, Redis, PostgreSQL

[View Room Service Docs](./room-service/README.md)

### 3. Sync Service (`sync-service`)

Owns live playback synchronization and room presence over WebSocket/STOMP.

- Port: `8081`
- Technology: Spring Boot, WebSocket, STOMP, SockJS

[View Sync Service Docs](./sync-service/README.md)

## Recommended Boundaries

The current split should stay narrow:

- `api-gateway`: single public entry point, routing, gateway filters, future rate limiting and auth integration
- `room-service`: room CRUD, room settings, active status, persistence, cache
- `sync-service`: playback events, presence updates, WebSocket session traffic

As NightsWatch grows, add new concerns as separate services instead of expanding the existing ones:

- `identity-service`: authentication, authorization, JWT or session issuance
- `user-service`: profiles, preferences, social graph
- `media-service`: provider integrations, link validation, metadata extraction
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
mvn spring-boot:run -pl room-service
mvn spring-boot:run -pl sync-service
mvn spring-boot:run -pl api-gateway
```

## Public Endpoints

Use the gateway as the main client entry point:

- Room API: `http://localhost:8082/api/v1/rooms`
- Room Swagger UI: `http://localhost:8082/api-docs.html`
- Room OpenAPI: `http://localhost:8082/v3/api-docs`
- Sync SockJS and WebSocket: `http://localhost:8082/api/ws-sync`

Direct service ports still work for local development:

- Room Service: `http://localhost:8080`
- Sync Service: `http://localhost:8081`

## Architecture

```text
+-------------------+        +---------------------+
| Client (Browser)  | -----> | API Gateway (8082)  |
+-------------------+        +----------+----------+
                                         |
                        +----------------+----------------+
                        |                                 |
                        v                                 v
                +---------------+                 +---------------+
                | Room Service  |                 | Sync Service  |
                |     8080      |                 |     8081      |
                | REST + DB     |                 | WS + STOMP    |
                +---------------+                 +---------------+
```

## Example Flow

1. A client creates a room through `POST /api/v1/rooms` on the gateway.
2. The gateway forwards the request to `room-service`.
3. Clients connect to `/api/ws-sync` on the gateway for live sync traffic.
4. The gateway forwards SockJS and WebSocket traffic to `sync-service`.

## Monorepo Structure

```text
nightswatch/
|-- api-gateway/
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
|-- pom.xml
`-- README.md
```

## Testing

```bash
mvn test
```
