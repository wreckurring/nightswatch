package com.nightswatch.roomservice.service.impl;

import com.nightswatch.roomservice.dto.CreateRoomRequest;
import com.nightswatch.roomservice.dto.RoomResponseDTO;
import com.nightswatch.roomservice.entity.Room;
import com.nightswatch.roomservice.exception.RoomInactiveException;
import com.nightswatch.roomservice.exception.RoomNotFoundException;
import com.nightswatch.roomservice.repository.RoomRepository;
import com.nightswatch.roomservice.store.RoomCacheService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RoomServiceImplTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomCacheService roomCacheService;

    private MeterRegistry meterRegistry;
    private RoomServiceImpl roomService;

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        roomService = new RoomServiceImpl(roomRepository, roomCacheService, meterRegistry);
    }

    @Test
    void testCreateRoom() {
        CreateRoomRequest request = CreateRoomRequest.builder()
                .hostId("user123")
                .currentVideoUrl("https://example.com/video.mp4")
                .build();

        Room savedRoom = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .currentVideoUrl("https://example.com/video.mp4")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        when(roomRepository.findByRoomCode(any())).thenReturn(Optional.empty());
        when(roomRepository.save(any(Room.class))).thenReturn(savedRoom);

        RoomResponseDTO response = roomService.createRoom(request);

        assertNotNull(response);
        assertEquals("ABC123", response.getRoomCode());
        assertEquals("user123", response.getHostId());
        assertTrue(response.isActive());
        verify(roomRepository, times(1)).save(any(Room.class));
        verify(roomCacheService, times(1)).put(any(RoomResponseDTO.class));
    }

    @Test
    void testGetRoomByCodeFromCache() {
        RoomResponseDTO cachedRoom = RoomResponseDTO.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        when(roomCacheService.get("ABC123")).thenReturn(Optional.of(cachedRoom));

        RoomResponseDTO response = roomService.getRoomByCode("ABC123");

        assertNotNull(response);
        assertEquals("ABC123", response.getRoomCode());
        verify(roomRepository, times(0)).findByRoomCode(any());
        verify(roomCacheService, times(1)).get("ABC123");
    }

    @Test
    void testGetRoomByCodeFromDatabase() {
        Room dbRoom = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        when(roomCacheService.get("ABC123")).thenReturn(Optional.empty());
        when(roomRepository.findByRoomCode("ABC123")).thenReturn(Optional.of(dbRoom));

        RoomResponseDTO response = roomService.getRoomByCode("ABC123");

        assertNotNull(response);
        assertEquals("ABC123", response.getRoomCode());
        verify(roomRepository, times(1)).findByRoomCode("ABC123");
        verify(roomCacheService, times(1)).put(any(RoomResponseDTO.class));
    }

    @Test
    void testGetRoomByCodeNotFound() {
        when(roomCacheService.get("INVALID")).thenReturn(Optional.empty());
        when(roomRepository.findByRoomCode("INVALID")).thenReturn(Optional.empty());

        assertThrows(RoomNotFoundException.class, () -> roomService.getRoomByCode("INVALID"));
    }

    @Test
    void testUpdateRoomVideoSuccess() {
        Room activeRoom = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .currentVideoUrl("old.mp4")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        when(roomRepository.findByRoomCode("ABC123")).thenReturn(Optional.of(activeRoom));
        when(roomRepository.save(any(Room.class))).thenReturn(activeRoom);

        RoomResponseDTO response = roomService.updateRoomVideo("ABC123", "new.mp4");

        assertNotNull(response);
        verify(roomRepository, times(1)).save(any(Room.class));
        verify(roomCacheService, times(1)).put(any(RoomResponseDTO.class));
    }

    @Test
    void testUpdateRoomVideoInactive() {
        Room inactiveRoom = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .isActive(false)
                .createdAt(Instant.now())
                .build();

        when(roomRepository.findByRoomCode("ABC123")).thenReturn(Optional.of(inactiveRoom));

        assertThrows(RoomInactiveException.class, () -> roomService.updateRoomVideo("ABC123", "new.mp4"));
    }

    @Test
    void testDeactivateRoom() {
        Room activeRoom = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .isActive(true)
                .createdAt(Instant.now())
                .build();

        when(roomRepository.findByRoomCode("ABC123")).thenReturn(Optional.of(activeRoom));
        when(roomRepository.save(any(Room.class))).thenReturn(activeRoom);

        roomService.deactivateRoom("ABC123");

        verify(roomRepository, times(1)).save(any(Room.class));
        verify(roomCacheService, times(1)).evict("ABC123");
    }
}
