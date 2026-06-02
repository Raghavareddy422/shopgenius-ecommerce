package com.shopgenius.seller.dto;

import com.shopgenius.product.dto.ProductDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SellerDashboardDto {
    private BigDecimal totalRevenue;
    private long totalItemsSold;
    private long totalProducts;
    private List<SellerSaleDto> recentSales;
    private List<ProductDto> lowStockProducts;
}
