package com.nightswatch.authservice.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;
import lombok.Value;
import lombok.extern.jackson.Jacksonized;

@Value
@Builder
@Jacksonized
public class LoginRequest {
    @NotBlank(message = "username is required")
    String username;

    @NotBlank(message = "password is required")
    String password;
}

