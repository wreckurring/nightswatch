package com.nightswatch.syncservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SyncMessage {
    private String roomCode;
    private String userId;
    private SyncAction action;
    private Double videoTimestamp;
}
