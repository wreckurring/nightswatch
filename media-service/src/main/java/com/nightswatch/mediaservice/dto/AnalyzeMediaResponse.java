package com.nightswatch.mediaservice.dto;

import com.nightswatch.mediaservice.entity.MediaProvider;
import com.nightswatch.mediaservice.entity.MediaType;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AnalyzeMediaResponse {
    String sourceUrl;
    String normalizedUrl;
    MediaProvider provider;
    MediaType mediaType;
    boolean embeddable;
    boolean supported;
}
