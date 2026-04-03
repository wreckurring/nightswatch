package com.nightswatch.mediaservice.exception;

import java.util.UUID;

public class MediaAssetNotFoundException extends RuntimeException {
    public MediaAssetNotFoundException(UUID id) {
        super("Media asset not found: " + id);
    }
}
