package com.nightswatch.roomservice.exception;

public class RoomInactiveException extends RuntimeException {
    public RoomInactiveException(String roomCode) {
        super("Room is not active: " + roomCode);
    }
}
