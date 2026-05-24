package com.shopgenius.order.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.order.dto.OrderCreateDto;
import com.shopgenius.order.dto.OrderDto;
import com.shopgenius.order.service.OrderService;
import com.shopgenius.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public ResponseEntity<ApiResponse<OrderDto>> placeOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderCreateDto dto) {
        OrderDto order = orderService.placeOrder(user.getId(), dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(order, "Order placed successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<OrderDto>>> getUserOrders(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        Page<OrderDto> orders = orderService.getUserOrders(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(orders, "Orders fetched successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderDto>> getOrderById(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        OrderDto order = orderService.getOrderById(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(order, "Order fetched successfully"));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<OrderDto>> updateOrderStatus(
            @PathVariable UUID id,
            @RequestParam String status) {
        OrderDto order = orderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success(order, "Order status updated successfully"));
    }
}
