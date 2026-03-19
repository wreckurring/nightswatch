package com.nightswatch.syncservice.controller;

import com.nightswatch.syncservice.dto.PresenceMessage;
import com.nightswatch.syncservice.dto.SyncMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class VideoSyncController {

    @MessageMapping("/room/{roomCode}/sync")
    @SendTo("/topic/room/{roomCode}/sync")
    public SyncMessage syncPlayback(
            @DestinationVariable String roomCode,
            SyncMessage syncMessage) {
        return syncMessage;
    }

    @MessageMapping("/room/{roomCode}/presence")
    @SendTo("/topic/room/{roomCode}/presence")
    public PresenceMessage broadcastPresence(
            @DestinationVariable String roomCode,
            PresenceMessage presenceMessage) {
        return presenceMessage;
    }
}
