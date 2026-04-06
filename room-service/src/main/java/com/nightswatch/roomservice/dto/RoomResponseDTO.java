package com.nightswatch.roomservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Set;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomResponseDTO {

    private UUID id;

    private String roomCode;

    private String hostId;

    private String currentVideoUrl;

    private boolean isActive;

    private Set<String> streamPermissions;

    private Instant createdAt;
}
