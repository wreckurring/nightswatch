# NightsWatch API Gateway

Client-facing entry point for the NightsWatch microservices platform.

## Purpose

This service uses Spring Cloud Gateway to provide a single host for browser and frontend traffic.

- Routes room management REST APIs to `room-service`
- Routes SockJS and WebSocket sync traffic to `sync-service`
- Keeps clients decoupled from internal service ports

## Port

- Gateway: `8082`

## Public Routes

- `http://localhost:8082/api/v1/rooms/**` -> `room-service`
- `http://localhost:8082/api-docs.html` -> `room-service`
- `http://localhost:8082/v3/api-docs/**` -> `room-service`
- `http://localhost:8082/api/ws-sync/**` -> `sync-service`

## Run

```bash
mvn spring-boot:run -pl api-gateway
```

## Service Boundary Guidance

Current services should stay focused like this:

- `api-gateway`: ingress, routing, edge concerns, rate limiting, auth integration later
- `room-service`: room lifecycle, room metadata, room settings, persistence, cache
- `sync-service`: live playback events, presence, WebSocket session coordination

Recommended next microservices as the product grows:

- `identity-service`: authentication, authorization, JWT or session issuance
- `user-service`: profiles, preferences, friendships, block lists
- `media-service`: video source validation, metadata extraction, provider-specific integrations
- `notification-service`: invites, room join notifications, async outbound messages
- `analytics-service`: room activity, playback metrics, product telemetry

That split keeps room state, live sync, and account concerns from collapsing into one service.
