package com.shopgenius.product.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.product.dto.PriceWatchRequestDto;
import com.shopgenius.product.entity.PriceWatch;
import com.shopgenius.product.service.PriceWatchService;
import com.shopgenius.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/price-watch")
@RequiredArgsConstructor
public class PriceWatchController {

    private final PriceWatchService priceWatchService;

    @PostMapping
    public ResponseEntity<ApiResponse<PriceWatch>> subscribe(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PriceWatchRequestDto request) {
        PriceWatch sub = priceWatchService.subscribeToPriceDrop(user.getId(), request.getProductId(), request.getTargetPrice());
        return ResponseEntity.ok(ApiResponse.success(sub, "Subscribed to price drop watch successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PriceWatch>>> getSubscriptions(@AuthenticationPrincipal User user) {
        List<PriceWatch> subs = priceWatchService.getUserSubscriptions(user.getId());
        return ResponseEntity.ok(ApiResponse.success(subs, "Subscriptions fetched successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> unsubscribe(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        priceWatchService.unsubscribe(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Unsubscribed from price drop watch successfully"));
    }
}
