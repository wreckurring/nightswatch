package com.nightswatch.roomservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoomVideoRequest {

    @NotBlank(message = "currentVideoUrl is required")
    private String currentVideoUrl;
}
