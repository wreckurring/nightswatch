package com.nightswatch.syncservice.client;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
public class RoomResponse {

    private String hostId;

    @JsonProperty("isActive")
    private boolean active;
}
