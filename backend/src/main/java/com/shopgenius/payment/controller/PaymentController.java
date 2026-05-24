package com.shopgenius.payment.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.payment.dto.PaymentRequestDto;
import com.shopgenius.payment.dto.PaymentResponseDto;
import com.shopgenius.payment.service.PaymentService;
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
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/process")
    public ResponseEntity<ApiResponse<PaymentResponseDto>> processPayment(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PaymentRequestDto request) {
            
        PaymentResponseDto response = paymentService.processPayment(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response, response.getMessage()));
    }
}
