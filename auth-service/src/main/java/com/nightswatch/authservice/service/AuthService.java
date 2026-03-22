package com.nightswatch.authservice.service;

import com.nightswatch.authservice.dto.AuthResponse;
import com.nightswatch.authservice.dto.LoginRequest;
import com.nightswatch.authservice.dto.RegisterRequest;
import com.nightswatch.authservice.dto.TokenValidationResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    TokenValidationResponse validate(String token);
}
