package com.shopgenius.cart.controller;

import com.shopgenius.cart.dto.CartDto;
import com.shopgenius.cart.dto.CartItemAddDto;
import com.shopgenius.cart.service.CartService;
import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<ApiResponse<CartDto>> getCart(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String couponCode) {
        CartDto cart = cartService.getCart(user.getId(), couponCode);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart fetched successfully"));
    }

    @PostMapping("/items")
    public ResponseEntity<ApiResponse<CartDto>> addItemToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartItemAddDto dto) {
        CartDto cart = cartService.addItemToCart(user.getId(), dto);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item added to cart successfully"));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> updateItemQuantity(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId,
            @RequestParam int quantity) {
        CartDto cart = cartService.updateItemQuantity(user.getId(), itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success(cart, "Cart item updated successfully"));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDto>> removeItemFromCart(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId) {
        CartDto cart = cartService.removeItemFromCart(user.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success(cart, "Item removed from cart successfully"));
    }

    @DeleteMapping
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Cart cleared successfully"));
    }
}
