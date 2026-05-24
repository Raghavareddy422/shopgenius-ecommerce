package com.shopgenius.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {
    private UUID id;
    private String sku;
    private String name;
    private String description;
    private BigDecimal price;
    private int stockQuantity;
    private UUID categoryId;
    private String categoryName;
    private String imageUrl;
    private int ecoScore;
    private boolean isActive;
    private String sizes;
}
