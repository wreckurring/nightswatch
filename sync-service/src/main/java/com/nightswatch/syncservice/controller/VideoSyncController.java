package com.nightswatch.syncservice.controller;

import com.nightswatch.syncservice.client.RoomClient;
import com.nightswatch.syncservice.dto.PresenceMessage;
import com.nightswatch.syncservice.dto.SyncAction;
import com.nightswatch.syncservice.dto.SyncMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;
import java.util.Set;

@Controller
@RequiredArgsConstructor
@Slf4j
public class VideoSyncController {

    private static final Set<SyncAction> HOST_ONLY_ACTIONS = Set.of(
            SyncAction.PLAY, SyncAction.PAUSE, SyncAction.SEEK);

    private final SimpMessagingTemplate messagingTemplate;
    private final RoomClient roomClient;

    @MessageMapping("/room/{roomCode}/sync")
    public void syncPlayback(@DestinationVariable String roomCode, SyncMessage message,
                             SimpMessageHeaderAccessor accessor) {
        String sender = resolveUsername(accessor);
        if (sender == null) {
            log.warn("Dropping sync message for room {} — no authenticated session", roomCode);
            return;
        }

        message.setUserId(sender);

        if (HOST_ONLY_ACTIONS.contains(message.getAction())) {
            String hostId = roomClient.getHostId(roomCode);
            if (!sender.equals(hostId)) {
                log.debug("Dropping {} from {} in room {} — sender is not the host", message.getAction(), sender, roomCode);
                return;
            }
        }

        messagingTemplate.convertAndSend("/topic/room/" + roomCode + "/sync", message);
    }

    @MessageMapping("/room/{roomCode}/presence")
    @SendTo("/topic/room/{roomCode}/presence")
    public PresenceMessage broadcastPresence(@DestinationVariable String roomCode,
                                             PresenceMessage presenceMessage,
                                             SimpMessageHeaderAccessor accessor) {
        String sender = resolveUsername(accessor);
        if (sender != null) {
            presenceMessage.setUserId(sender);
        }
        return presenceMessage;
    }

    private String resolveUsername(SimpMessageHeaderAccessor accessor) {
        Map<String, Object> attrs = accessor.getSessionAttributes();
        if (attrs == null) {
            return null;
        }
        Object username = attrs.get("username");
        return username instanceof String s ? s : null;
    }
}
