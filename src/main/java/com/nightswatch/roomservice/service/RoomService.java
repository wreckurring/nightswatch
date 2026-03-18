package com.nightswatch.roomservice.service;

import com.nightswatch.roomservice.dto.CreateRoomRequest;
import com.nightswatch.roomservice.dto.RoomResponseDTO;

public interface RoomService {
    RoomResponseDTO createRoom(CreateRoomRequest request);
    RoomResponseDTO getRoomByCode(String roomCode);
    RoomResponseDTO updateRoomVideo(String roomCode, String currentVideoUrl);
    void deactivateRoom(String roomCode);
}
