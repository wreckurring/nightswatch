package com.nightswatch.mediaservice.dto;

import com.nightswatch.mediaservice.entity.MediaProvider;
import com.nightswatch.mediaservice.entity.MediaType;
import lombok.Builder;
import lombok.Value;

import java.time.Instant;
import java.util.UUID;

@Value
@Builder
public class MediaAssetResponse {
    UUID id;
    String sourceUrl;
    String normalizedUrl;
    String title;
    MediaProvider provider;
    MediaType mediaType;
    boolean embeddable;
    String createdBy;
    Instant createdAt;
}
