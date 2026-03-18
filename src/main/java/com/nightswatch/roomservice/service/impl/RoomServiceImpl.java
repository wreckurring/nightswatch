package com.nightswatch.roomservice.service.impl;

import com.nightswatch.roomservice.dto.CreateRoomRequest;
import com.nightswatch.roomservice.dto.RoomResponseDTO;
import com.nightswatch.roomservice.entity.Room;
import com.nightswatch.roomservice.exception.RoomInactiveException;
import com.nightswatch.roomservice.exception.RoomNotFoundException;
import com.nightswatch.roomservice.repository.RoomRepository;
import com.nightswatch.roomservice.service.RoomService;
import com.nightswatch.roomservice.store.RoomCacheService;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private static final String ROOM_CODE_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final int ROOM_CODE_LENGTH = 6;
    private static final int MAX_ROOM_CODE_ATTEMPTS = 5;

    private final RoomRepository roomRepository;
    private final RoomCacheService roomCacheService;
    private final MeterRegistry meterRegistry;

    private final SecureRandom secureRandom = new SecureRandom();

    @Override
    @Transactional
    public RoomResponseDTO createRoom(CreateRoomRequest request) {
        String roomCode = generateUniqueRoomCode();

        Room room = Room.builder()
                .roomCode(roomCode)
                .hostId(request.getHostId())
                .currentVideoUrl(request.getCurrentVideoUrl())
                .isActive(true)
                .build();

        room = roomRepository.save(room);
        Counter.builder("room.created").register(meterRegistry).increment();

        RoomResponseDTO response = toDto(room);
        roomCacheService.put(response);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponseDTO getRoomByCode(String roomCode) {
        Optional<RoomResponseDTO> cached = roomCacheService.get(roomCode);
        if (cached.isPresent()) {
            Counter.builder("room.cache.hit").register(meterRegistry).increment();
            return cached.get();
        }
        
        Counter.builder("room.cache.miss").register(meterRegistry).increment();
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RoomNotFoundException(roomCode));
        RoomResponseDTO response = toDto(room);
        roomCacheService.put(response);
        return response;
    }

    @Override
    @Transactional
    public RoomResponseDTO updateRoomVideo(String roomCode, String currentVideoUrl) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RoomNotFoundException(roomCode));

        if (!room.isActive()) {
            throw new RoomInactiveException(roomCode);
        }

        if (!Objects.equals(room.getCurrentVideoUrl(), currentVideoUrl)) {
            room.setCurrentVideoUrl(currentVideoUrl);
            room = roomRepository.save(room);
            Counter.builder("room.video.updated").register(meterRegistry).increment();
        }

        RoomResponseDTO response = toDto(room);
        roomCacheService.put(response);
        return response;
    }

    @Override
    @Transactional
    public void deactivateRoom(String roomCode) {
        Room room = roomRepository.findByRoomCode(roomCode)
                .orElseThrow(() -> new RoomNotFoundException(roomCode));

        if (!room.isActive()) {
            return;
        }

        room.setActive(false);
        roomRepository.save(room);
        roomCacheService.evict(roomCode);
        Counter.builder("room.deactivated").register(meterRegistry).increment();
    }

    private String generateUniqueRoomCode() {
        for (int attempt = 0; attempt < MAX_ROOM_CODE_ATTEMPTS; attempt++) {
            String candidate = generateRoomCode();
            if (roomRepository.findByRoomCode(candidate).isEmpty()) {
                return candidate;
            }
        }
        throw new IllegalStateException("Unable to generate unique room code after " + MAX_ROOM_CODE_ATTEMPTS + " attempts");
    }

    private String generateRoomCode() {
        StringBuilder sb = new StringBuilder(ROOM_CODE_LENGTH);
        for (int i = 0; i < ROOM_CODE_LENGTH; i++) {
            int index = secureRandom.nextInt(ROOM_CODE_CHARS.length());
            sb.append(ROOM_CODE_CHARS.charAt(index));
        }
        return sb.toString().toUpperCase(Locale.ROOT);
    }

    private RoomResponseDTO toDto(Room room) {
        return RoomResponseDTO.builder()
                .id(room.getId())
                .roomCode(room.getRoomCode())
                .hostId(room.getHostId())
                .currentVideoUrl(room.getCurrentVideoUrl())
                .isActive(room.isActive())
                .createdAt(room.getCreatedAt())
                .build();
    }
}
