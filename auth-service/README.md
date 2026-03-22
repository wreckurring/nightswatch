# NightsWatch Auth Service

JWT authentication microservice for NightsWatch.

## Responsibilities

- Register users
- Authenticate credentials
- Issue signed JWT access tokens
- Validate tokens for future gateway or service-to-service checks

## Port

- `8083`

## Endpoints

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/validate`
- Swagger UI: `http://localhost:8083/auth-docs.html`

## Notes

- Uses PostgreSQL for user persistence
- Uses BCrypt for password hashing
- Issues stateless JWT access tokens
- Keeps auth concerns separate from room and sync logic
