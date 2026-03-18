package com.nightswatch.roomservice.controller;

import com.nightswatch.roomservice.dto.CreateRoomRequest;
import com.nightswatch.roomservice.dto.UpdateRoomVideoRequest;
import com.nightswatch.roomservice.entity.Room;
import com.nightswatch.roomservice.repository.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import com.fasterxml.jackson.databind.ObjectMapper;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RoomControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired(required = false)
    private RedisTemplate<?> redisTemplate;

    @BeforeEach
    void setUp() {
        roomRepository.deleteAll();
        if (redisTemplate != null) {
            redisTemplate.getConnectionFactory().getConnection().flushAll();
        }
    }

    @Test
    void testCreateRoom() throws Exception {
        CreateRoomRequest request = CreateRoomRequest.builder()
                .hostId("user123")
                .currentVideoUrl("http://example.com/video.mp4")
                .build();

        mockMvc.perform(post("/api/v1/rooms")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomCode", notNullValue()))
                .andExpect(jsonPath("$.hostId", is("user123")))
                .andExpect(jsonPath("$.currentVideoUrl", is("http://example.com/video.mp4")))
                .andExpect(jsonPath("$.isActive", is(true)));
    }

    @Test
    void testCreateRoomWithoutHostId() throws Exception {
        CreateRoomRequest request = CreateRoomRequest.builder()
                .currentVideoUrl("http://example.com/video.mp4")
                .build();

        mockMvc.perform(post("/api/v1/rooms")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", notNullValue()));
    }

    @Test
    void testGetRoom() throws Exception {
        Room room = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .currentVideoUrl("http://example.com/video.mp4")
                .isActive(true)
                .createdAt(Instant.now())
                .build();
        roomRepository.save(room);

        mockMvc.perform(get("/api/v1/rooms/ABC123"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.roomCode", is("ABC123")))
                .andExpect(jsonPath("$.hostId", is("user123")))
                .andExpect(jsonPath("$.isActive", is(true)));
    }

    @Test
    void testGetRoomNotFound() throws Exception {
        mockMvc.perform(get("/api/v1/rooms/NOTFOUND"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message", containsString("Room not found")));
    }

    @Test
    void testUpdateRoomVideo() throws Exception {
        Room room = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .currentVideoUrl("http://example.com/old.mp4")
                .isActive(true)
                .createdAt(Instant.now())
                .build();
        roomRepository.save(room);

        UpdateRoomVideoRequest request = UpdateRoomVideoRequest.builder()
                .currentVideoUrl("http://example.com/new.mp4")
                .build();

        mockMvc.perform(patch("/api/v1/rooms/ABC123/video")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currentVideoUrl", is("http://example.com/new.mp4")));
    }

    @Test
    void testUpdateVideoOnInactiveRoom() throws Exception {
        Room room = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .currentVideoUrl("http://example.com/video.mp4")
                .isActive(false)
                .createdAt(Instant.now())
                .build();
        roomRepository.save(room);

        UpdateRoomVideoRequest request = UpdateRoomVideoRequest.builder()
                .currentVideoUrl("http://example.com/new.mp4")
                .build();

        mockMvc.perform(patch("/api/v1/rooms/ABC123/video")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("not active")));
    }

    @Test
    void testDeactivateRoom() throws Exception {
        Room room = Room.builder()
                .id(UUID.randomUUID())
                .roomCode("ABC123")
                .hostId("user123")
                .isActive(true)
                .createdAt(Instant.now())
                .build();
        roomRepository.save(room);

        mockMvc.perform(delete("/api/v1/rooms/ABC123"))
                .andExpect(status().isNoContent());

        Room deactivated = roomRepository.findByRoomCode("ABC123").orElseThrow();
        assert !deactivated.isActive();
    }
}
