package com.nightswatch.syncservice.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Slf4j
public class RoomClient {

    private final RestClient restClient;
    private final ConcurrentHashMap<String, String> hostCache = new ConcurrentHashMap<>();

    public RoomClient(@Value("${services.room-service.uri:http://localhost:8080}") String roomServiceUri) {
        this.restClient = RestClient.builder()
                .baseUrl(roomServiceUri)
                .build();
    }

    public String getHostId(String roomCode) {
        return hostCache.computeIfAbsent(roomCode, this::fetchHostId);
    }

    public Set<String> getStreamPermissions(String roomCode) {
        try {
            RoomResponse room = restClient.get()
                    .uri("/api/v1/rooms/{code}", roomCode)
                    .retrieve()
                    .body(RoomResponse.class);
            if (room != null && room.getStreamPermissions() != null) {
                return room.getStreamPermissions();
            }
        } catch (RestClientException e) {
            log.warn("Failed to fetch stream permissions for room {}: {}", roomCode, e.getMessage());
        }
        return Collections.emptySet();
    }

    private String fetchHostId(String roomCode) {
        try {
            RoomResponse room = restClient.get()
                    .uri("/api/v1/rooms/{code}", roomCode)
                    .retrieve()
                    .body(RoomResponse.class);
            return room != null ? room.getHostId() : null;
        } catch (RestClientException e) {
            log.warn("Failed to fetch host for room {}: {}", roomCode, e.getMessage());
            return null;
        }
    }
}
