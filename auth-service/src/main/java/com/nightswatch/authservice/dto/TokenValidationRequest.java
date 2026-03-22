package com.nightswatch.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class TokenValidationRequest {
    @NotBlank(message = "token is required")
    String token;
}

