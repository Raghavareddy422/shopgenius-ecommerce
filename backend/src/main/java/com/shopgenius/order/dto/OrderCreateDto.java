package com.shopgenius.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreateDto {

    @NotNull(message = "Shipping address ID is required")
    private UUID shippingAddressId;

    private String couponCode;

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;
}
