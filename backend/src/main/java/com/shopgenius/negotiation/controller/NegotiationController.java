package com.shopgenius.negotiation.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.negotiation.dto.NegotiationRequestDto;
import com.shopgenius.negotiation.dto.NegotiationResponseDto;
import com.shopgenius.negotiation.service.NegotiationService;
import com.shopgenius.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/negotiate")
@RequiredArgsConstructor
public class NegotiationController {

    private final NegotiationService negotiationService;

    @PostMapping
    public ResponseEntity<ApiResponse<NegotiationResponseDto>> negotiate(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NegotiationRequestDto request) {
            
        NegotiationResponseDto response = negotiationService.negotiate(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }

    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<Void>> accept(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NegotiationRequestDto request) {
            
        negotiationService.accept(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(null, "Negotiation price accepted successfully"));
    }
}
