# NightsWatch Room Service

A production-ready **Spring Boot 3.x microservice** for managing remote co-watching rooms. Part of the NightsWatch distributed application.

## 🎯 Features

### Core Functionality
- **Room Management**: Create, retrieve, update, and soft-delete watch rooms
- **Unique Room Codes**: Auto-generates 6-character alphanumeric codes for room joining
- **Video Synchronization**: Update currently playing video URL per room
- **Room Status**: Track active/inactive rooms with timestamps

### Infrastructure & Observability
- **Redis Caching**: Fast retrieval of active rooms with configurable TTL
- **PostgreSQL**: Persistent room metadata storage
- **HTTP Logging**: Automatic request/response logging with duration tracking
- **Metrics**: Micrometer counters exported to Prometheus
- **OpenAPI/Swagger**: Full auto-generated API documentation

### Quality Assurance
- **16 Comprehensive Tests**: Unit tests (Mockito) + Integration tests (MockMvc + H2)
- **Global Exception Handling**: Structured error responses
- **Input Validation**: Jakarta Bean Validation annotations

## 📋 Tech Stack

| Layer | Technology |
|-------|------------|
| **Language** | Java 17+ |
| **Framework** | Spring Boot 3.2.2 |
| **Build Tool** | Maven |
| **Database** | PostgreSQL 12+ |
| **Cache** | Redis 6+ |
| **API Docs** | OpenAPI 3.0 / Swagger UI |
| **Metrics** | Micrometer + Prometheus |
| **Testing** | JUnit 5, Mockito, TestContainers |

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- PostgreSQL 12+ running on `localhost:5432`
- Redis 6+ running on `localhost:6379`

### Installation & Run

```bash
git clone https://github.com/wreckurring/nightswatch.git
cd nightswatch

mvn clean install
mvn spring-boot:run
```

**Server starts on:** `http://localhost:8080`

## 📡 REST API Endpoints

### 1. Create Room
```bash
POST /api/v1/rooms
Content-Type: application/json

{
  "hostId": "user123",
  "currentVideoUrl": "https://example.com/video.mp4"
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "roomCode": "ABC123",
  "hostId": "user123",
  "currentVideoUrl": "https://example.com/video.mp4",
  "isActive": true,
  "createdAt": "2026-03-18T10:30:00Z"
}
```

### 2. Get Room
```bash
GET /api/v1/rooms/{roomCode}
```

Returns room details (checks Redis cache first, then PostgreSQL).

### 3. Update Video URL
```bash
PATCH /api/v1/rooms/{roomCode}/video
Content-Type: application/json

{
  "currentVideoUrl": "https://example.com/new-video.mp4"
}
```

(Only works if room is active)

### 4. Deactivate Room
```bash
DELETE /api/v1/rooms/{roomCode}
```

Soft-deletes by setting `isActive=false`.

## 📊 API Documentation

Access Swagger UI:
```
http://localhost:8080/api-docs.html
```

## 🔍 Monitoring & Metrics

### Health Check
```
GET /actuator/health
```

### Prometheus Metrics
```
GET /actuator/prometheus
```

**Available Counters:**
- `room.created` — Number of rooms created
- `room.cache.hit` — Redis cache hits
- `room.cache.miss` — Cache misses (fallback to DB)
- `room.video.updated` — Video URL updates
- `room.deactivated` — Rooms deactivated

## 🧪 Testing

### Run All Tests
```bash
mvn test
```

### Unit Tests (8 tests)
- Service layer logic (create, read, update, deactivate)
- Cache behavior (hit/miss)
- Exception handling

```bash
mvn test -Dtest=RoomServiceImplTest
```

### Integration Tests (8 tests)
- Full REST API endpoints
- HTTP status codes
- Database persistence
- Input validation

```bash
mvn test -Dtest=RoomControllerIntegrationTest
```

**Test Database:** H2 in-memory (auto-configured via `application-test.yml`)

## ⚙️ Configuration

### application.yml (Production)
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/roomdb
    username: postgres
    password: postgres

  redis:
    host: localhost
    port: 6379

management:
  endpoints:
    web:
      exposure:
        include: health, metrics, prometheus

room-service:
  cache:
    ttl-seconds: 600
```

### application-test.yml (Testing)
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
  jpa:
    database-platform: org.hibernate.dialect.H2Dialect
```

## 📁 Project Structure

```
nightswatch/
├── src/
│   ├── main/
│   │   ├── java/com/nightswatch/roomservice/
│   │   │   ├── RoomServiceApplication.java      (Boot entry point)
│   │   │   ├── entity/
│   │   │   │   └── Room.java                    (JPA entity)
│   │   │   ├── dto/
│   │   │   │   ├── CreateRoomRequest.java
│   │   │   │   ├── UpdateRoomVideoRequest.java
│   │   │   │   └── RoomResponseDTO.java
│   │   │   ├── repository/
│   │   │   │   └── RoomRepository.java          (JpaRepository)
│   │   │   ├── service/
│   │   │   │   ├── RoomService.java             (Interface)
│   │   │   │   └── impl/
│   │   │   │       └── RoomServiceImpl.java      (Implementation + metrics)
│   │   │   ├── controller/
│   │   │   │   └── RoomController.java          (REST endpoints + Swagger)
│   │   │   ├── config/
│   │   │   │   ├── RedisConfig.java
│   │   │   │   └── LoggingConfig.java
│   │   │   ├── store/
│   │   │   │   └── RoomCacheService.java        (Redis abstraction)
│   │   │   ├── exception/
│   │   │   │   ├── RoomNotFoundException.java
│   │   │   │   ├── RoomInactiveException.java
│   │   │   │   └── GlobalExceptionHandler.java
│   │   │   └── model/
│   │   │       └── ErrorResponse.java
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── java/com/nightswatch/roomservice/
│       │   ├── service/impl/
│       │   │   └── RoomServiceImplTest.java
│       │   └── controller/
│       │       └── RoomControllerIntegrationTest.java
│       └── resources/
│           └── application-test.yml
├── pom.xml
└── README.md
```

## 🔄 Architecture Pattern

**Controller → Service → Repository**

```
REST Request
    ↓
RoomController (REST endpoint + validation)
    ↓
RoomService (business logic)
    ↓
RoomCacheService (Redis check)
    ↓
RoomRepository (PostgreSQL)
    ↓
Database
```

## 🔒 Exception Handling

All exceptions return structured JSON:

```json
{
  "timestamp": "2026-03-18T10:35:00Z",
  "status": 404,
  "error": "Not Found",
  "message": "Room not found for code: INVALID",
  "path": "/api/v1/rooms/INVALID"
}
```

**Custom Exceptions:**
- `RoomNotFoundException` (404)
- `RoomInactiveException` (400)

## 🐳 Docker Support (Optional)

Build Docker image:
```bash
mvn clean package -DskipTests
docker build -t nightswatch-room-service:1.0 .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://db:5432/roomdb \
  -e SPRING_REDIS_HOST=redis \
  nightswatch-room-service:1.0
```

## 📝 Commit History

| Commit | Message |
|--------|---------|
| fcc2676 | feat: add core room service domain layer and REST API |
| 5a6b88e | feat: add redis caching, logging interceptor, and configuration |
| bcb9803 | test: add comprehensive unit and integration tests with metrics |

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
