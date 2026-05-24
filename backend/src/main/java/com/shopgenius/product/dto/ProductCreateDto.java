package com.shopgenius.product.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductCreateDto {

    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than zero")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = false, message = "Cost price must be greater than zero")
    private BigDecimal costPrice;

    @Min(value = 0, message = "Stock quantity cannot be negative")
    private int stockQuantity;

    private UUID categoryId;

    private String imageUrl;
    
    @Min(value = 0, message = "Eco score cannot be less than 0")
    private int ecoScore = 50;

    private String sizes;
}
