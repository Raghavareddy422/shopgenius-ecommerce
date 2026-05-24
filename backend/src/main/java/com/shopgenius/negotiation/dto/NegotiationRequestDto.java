package com.shopgenius.negotiation.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NegotiationRequestDto {

    @NotNull(message = "Product ID is required")
    private UUID productId;

    @NotNull(message = "Offered price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Offered price must be greater than zero")
    private BigDecimal offeredPrice;
}
