package com.shopgenius.auth.controller;

import com.shopgenius.auth.dto.AuthResponse;
import com.shopgenius.auth.dto.LoginRequest;
import com.shopgenius.auth.dto.RegisterRequest;
import com.shopgenius.auth.dto.TokenRefreshRequest;
import com.shopgenius.auth.entity.RefreshToken;
import com.shopgenius.auth.service.AuthService;
import com.shopgenius.auth.service.RefreshTokenService;
import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.exception.BusinessException;
import com.shopgenius.security.jwt.JwtService;
import com.shopgenius.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();

        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtService.generateToken(user);
                    AuthResponse response = AuthResponse.builder()
                            .token(token)
                            .refreshToken(requestRefreshToken)
                            .email(user.getEmail())
                            .build();
                    return ResponseEntity.ok(ApiResponse.success(response, "Token refreshed successfully"));
                })
                .orElseThrow(() -> new BusinessException("Refresh token is not in database!", HttpStatus.FORBIDDEN));
    }
}
