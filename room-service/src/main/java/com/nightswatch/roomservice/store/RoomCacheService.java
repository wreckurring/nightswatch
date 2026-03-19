package com.nightswatch.roomservice.store;

import com.nightswatch.roomservice.dto.RoomResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class RoomCacheService {

    private static final String KEY_PREFIX = "room:";

    private final RedisTemplate<String, RoomResponseDTO> redisTemplate;

    private final ValueOperations<String, RoomResponseDTO> valueOps;

    @Value("${room-service.cache.ttl-seconds:0}")
    private long ttlSeconds;

    public Optional<RoomResponseDTO> get(String roomCode) {
        return Optional.ofNullable(valueOps.get(getKey(roomCode)));
    }

    public void put(RoomResponseDTO room) {
        String key = getKey(room.getRoomCode());
        if (ttlSeconds > 0) {
            valueOps.set(key, room, Duration.ofSeconds(ttlSeconds));
        } else {
            valueOps.set(key, room);
        }
    }

    public void evict(String roomCode) {
        redisTemplate.delete(getKey(roomCode));
    }

    private String getKey(String roomCode) {
        return KEY_PREFIX + roomCode;
    }
}
