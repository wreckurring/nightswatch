package com.nightswatch.authservice.dto;

import lombok.Builder;
import lombok.Value;

import java.time.Instant;

@Value
@Builder
public class TokenValidationResponse {
    boolean valid;
    String username;
    String email;
    String role;
    Instant expiresAt;
}
