package com.nightswatch.authservice.dto;

import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class AuthResponse {
    String token;
    String tokenType;
    long expiresInSeconds;
    String username;
    String email;
    String role;
}
