package com.shopgenius.seller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerSaleDto {
    private UUID orderId;
    private String productName;
    private int quantity;
    private BigDecimal price;
    private String buyerName;
    private LocalDateTime orderDate;
    private String status;
}
