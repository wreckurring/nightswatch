package com.nightswatch.mediaservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class CreateMediaAssetRequest {
    @NotBlank(message = "url is required")
    String url;

    @NotBlank(message = "title is required")
    String title;

    @NotBlank(message = "createdBy is required")
    String createdBy;
}
