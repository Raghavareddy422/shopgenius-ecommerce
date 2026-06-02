package com.shopgenius.seller.service;

import com.shopgenius.category.entity.Category;
import com.shopgenius.category.repository.CategoryRepository;
import com.shopgenius.exception.BusinessException;
import com.shopgenius.order.entity.OrderItem;
import com.shopgenius.order.repository.OrderItemRepository;
import com.shopgenius.product.dto.ProductCreateDto;
import com.shopgenius.product.dto.ProductDto;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.mapper.ProductMapper;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.seller.dto.SellerDashboardDto;
import com.shopgenius.seller.dto.SellerSaleDto;
import com.shopgenius.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SellerService {

    private final ProductRepository productRepository;
    private final OrderItemRepository orderItemRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public SellerDashboardDto getSellerDashboard(User seller) {
        List<OrderItem> completedSales = orderItemRepository.findCompletedSalesBySellerId(seller.getId());
        
        BigDecimal totalRevenue = completedSales.stream()
                .map(item -> item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        long totalItemsSold = completedSales.stream()
                .mapToLong(OrderItem::getQuantity)
                .sum();
        
        long totalProducts = productRepository.countBySellerId(seller.getId());
        
        List<OrderItem> recentSalesItems = orderItemRepository.findRecentSalesBySellerId(seller.getId());
        // Limit to top 15 recent sales
        List<SellerSaleDto> recentSales = recentSalesItems.stream()
                .limit(15)
                .map(item -> SellerSaleDto.builder()
                        .orderId(item.getOrder().getId())
                        .productName(item.getProduct().getName())
                        .quantity(item.getQuantity())
                        .price(item.getPrice())
                        .buyerName(item.getOrder().getUser().getFirstName() + " " + item.getOrder().getUser().getLastName())
                        .orderDate(item.getOrder().getCreatedAt())
                        .status(item.getOrder().getStatus())
                        .build())
                .collect(Collectors.toList());
        
        List<Product> lowStock = productRepository.findLowStockProducts(seller.getId(), 5);
        List<ProductDto> lowStockProducts = lowStock.stream()
                .map(productMapper::toDto)
                .collect(Collectors.toList());
        
        return SellerDashboardDto.builder()
                .totalRevenue(totalRevenue)
                .totalItemsSold(totalItemsSold)
                .totalProducts(totalProducts)
                .recentSales(recentSales)
                .lowStockProducts(lowStockProducts)
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ProductDto> getSellerProducts(User seller, Pageable pageable) {
        return productRepository.findBySellerId(seller.getId(), pageable)
                .map(productMapper::toDto);
    }

    @Transactional
    public ProductDto createSellerProduct(ProductCreateDto dto, User seller) {
        if (productRepository.existsBySku(dto.getSku())) {
            throw new BusinessException("Product with this SKU already exists", HttpStatus.BAD_REQUEST);
        }

        Product product = Product.builder()
                .sku(dto.getSku())
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice())
                .costPrice(dto.getCostPrice())
                .stockQuantity(dto.getStockQuantity())
                .imageUrl(dto.getImageUrl())
                .ecoScore(dto.getEcoScore())
                .sizes(dto.getSizes())
                .seller(seller)
                .active(true)
                .build();

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessException("Category not found", HttpStatus.NOT_FOUND));
            product.setCategory(category);
        }

        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    @Transactional
    public ProductDto updateSellerProduct(UUID productId, ProductCreateDto dto, User seller) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new BusinessException("You are not authorized to update this product", HttpStatus.FORBIDDEN);
        }

        if (!product.getSku().equals(dto.getSku()) && productRepository.existsBySku(dto.getSku())) {
            throw new BusinessException("Product with this SKU already exists", HttpStatus.BAD_REQUEST);
        }

        product.setSku(dto.getSku());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setPrice(dto.getPrice());
        product.setCostPrice(dto.getCostPrice());
        product.setStockQuantity(dto.getStockQuantity());
        product.setImageUrl(dto.getImageUrl());
        product.setEcoScore(dto.getEcoScore());
        product.setSizes(dto.getSizes());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new BusinessException("Category not found", HttpStatus.NOT_FOUND));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        Product saved = productRepository.save(product);
        return productMapper.toDto(saved);
    }

    @Transactional
    public void deleteSellerProduct(UUID productId, User seller) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        if (product.getSeller() == null || !product.getSeller().getId().equals(seller.getId())) {
            throw new BusinessException("You are not authorized to delete this product", HttpStatus.FORBIDDEN);
        }

        productRepository.delete(product);
    }
}
