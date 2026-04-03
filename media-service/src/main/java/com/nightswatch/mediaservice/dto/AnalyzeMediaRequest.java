package com.nightswatch.mediaservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class AnalyzeMediaRequest {
    @NotBlank(message = "url is required")
    String url;
}
