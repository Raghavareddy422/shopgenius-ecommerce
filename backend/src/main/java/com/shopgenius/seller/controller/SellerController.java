package com.shopgenius.seller.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.product.dto.ProductCreateDto;
import com.shopgenius.product.dto.ProductDto;
import com.shopgenius.seller.dto.SellerDashboardDto;
import com.shopgenius.seller.service.SellerService;
import com.shopgenius.user.entity.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/seller")
@RequiredArgsConstructor
public class SellerController {

    private final SellerService sellerService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<SellerDashboardDto>> getDashboard(@AuthenticationPrincipal User user) {
        SellerDashboardDto dashboard = sellerService.getSellerDashboard(user);
        return ResponseEntity.ok(ApiResponse.success(dashboard, "Seller dashboard fetched successfully"));
    }

    @GetMapping("/products")
    public ResponseEntity<ApiResponse<Page<ProductDto>>> getProducts(
            @AuthenticationPrincipal User user,
            Pageable pageable) {
        Page<ProductDto> products = sellerService.getSellerProducts(user, pageable);
        return ResponseEntity.ok(ApiResponse.success(products, "Seller products fetched successfully"));
    }

    @PostMapping("/products")
    public ResponseEntity<ApiResponse<ProductDto>> createProduct(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProductCreateDto dto) {
        ProductDto product = sellerService.createSellerProduct(dto, user);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(product, "Product listed for sale successfully"));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ApiResponse<ProductDto>> updateProduct(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody ProductCreateDto dto) {
        ProductDto product = sellerService.updateSellerProduct(id, dto, user);
        return ResponseEntity.ok(ApiResponse.success(product, "Product listing updated successfully"));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        sellerService.deleteSellerProduct(id, user);
        return ResponseEntity.ok(ApiResponse.success(null, "Product listing deleted successfully"));
    }
}
