package com.nightswatch.authservice.service.impl;

import com.nightswatch.authservice.dto.AuthResponse;
import com.nightswatch.authservice.dto.LoginRequest;
import com.nightswatch.authservice.dto.RegisterRequest;
import com.nightswatch.authservice.dto.TokenValidationResponse;
import com.nightswatch.authservice.entity.UserAccount;
import com.nightswatch.authservice.exception.AuthConflictException;
import com.nightswatch.authservice.exception.AuthUnauthorizedException;
import com.nightswatch.authservice.repository.UserAccountRepository;
import com.nightswatch.authservice.service.AuthService;
import com.nightswatch.authservice.service.JwtService;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_ROLE = "USER";

    private final UserAccountRepository userAccountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String normalizedUsername = normalize(request.getUsername());
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userAccountRepository.existsByUsernameIgnoreCase(normalizedUsername)) {
            throw new AuthConflictException("username is already taken");
        }
        if (userAccountRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new AuthConflictException("email is already registered");
        }

        UserAccount userAccount = UserAccount.builder()
                .username(normalizedUsername)
                .email(normalizedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(DEFAULT_ROLE)
                .build();

        userAccount = userAccountRepository.save(userAccount);
        return toAuthResponse(userAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        UserAccount userAccount = userAccountRepository.findByUsernameIgnoreCase(normalize(request.getUsername()))
                .orElseThrow(() -> new AuthUnauthorizedException("invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), userAccount.getPasswordHash())) {
            throw new AuthUnauthorizedException("invalid username or password");
        }

        return toAuthResponse(userAccount);
    }

    @Override
    @Transactional(readOnly = true)
    public TokenValidationResponse validate(String token) {
        try {
            Claims claims = jwtService.parseToken(token);
            return TokenValidationResponse.builder()
                    .valid(true)
                    .username(claims.getSubject())
                    .email(claims.get("email", String.class))
                    .role(claims.get("role", String.class))
                    .expiresAt(claims.getExpiration().toInstant())
                    .build();
        } catch (Exception ex) {
            throw new AuthUnauthorizedException("token is invalid or expired");
        }
    }

    private AuthResponse toAuthResponse(UserAccount userAccount) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(userAccount))
                .tokenType("Bearer")
                .expiresInSeconds(jwtService.getExpirationSeconds())
                .username(userAccount.getUsername())
                .email(userAccount.getEmail())
                .role(userAccount.getRole())
                .build();
    }

    private String normalize(String username) {
        return username.trim().toLowerCase(Locale.ROOT);
    }
}
