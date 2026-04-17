# Stage 1 — build the React app
FROM node:20-alpine AS build
WORKDIR /app

# Accept VITE_API_URL as a build arg (empty = use relative paths via Nginx proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

COPY package*.json ./
RUN npm ci --prefer-offline

COPY . .
RUN npm run build

# Stage 2 — serve with Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
