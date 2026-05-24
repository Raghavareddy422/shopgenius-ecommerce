package com.shopgenius.negotiation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NegotiationResponseDto {
    private String status; // ACCEPTED, REJECTED, COUNTER_OFFERED
    private BigDecimal originalPrice;
    private BigDecimal offeredPrice;
    private BigDecimal counterPrice;
    private String message;
}
