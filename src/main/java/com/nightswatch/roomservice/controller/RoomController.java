package com.nightswatch.roomservice.controller;

import com.nightswatch.roomservice.dto.CreateRoomRequest;
import com.nightswatch.roomservice.dto.RoomResponseDTO;
import com.nightswatch.roomservice.dto.UpdateRoomVideoRequest;
import com.nightswatch.roomservice.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/rooms")
@RequiredArgsConstructor
@Validated
@Tag(name = "Room Management", description = "APIs for creating, retrieving, and managing watch rooms")
public class RoomController {

    private final RoomService roomService;

    @PostMapping
    @Operation(summary = "Create a new room", description = "Creates a new watch room with a unique 6-character code")
    public ResponseEntity<RoomResponseDTO> createRoom(@Valid @RequestBody CreateRoomRequest request) {
        RoomResponseDTO response = roomService.createRoom(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{roomCode}")
    @Operation(summary = "Get room details", description = "Retrieves room info by code (cached in Redis)")
    public ResponseEntity<RoomResponseDTO> getRoom(@PathVariable String roomCode) {
        RoomResponseDTO response = roomService.getRoomByCode(roomCode);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{roomCode}/video")
    @Operation(summary = "Update video URL", description = "Updates the currently playing video URL")
    public ResponseEntity<RoomResponseDTO> updateVideo(
            @PathVariable String roomCode,
            @Valid @RequestBody UpdateRoomVideoRequest request) {

        RoomResponseDTO response = roomService.updateRoomVideo(roomCode, request.getCurrentVideoUrl());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{roomCode}")
    @Operation(summary = "Deactivate room", description = "Soft-deletes a room (sets isActive=false)")
    public ResponseEntity<Void> deactivateRoom(@PathVariable String roomCode) {
        roomService.deactivateRoom(roomCode);
        return ResponseEntity.noContent().build();
    }
}
