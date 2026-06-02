package com.shopgenius.product.repository;

import com.shopgenius.product.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {
    boolean existsBySku(String sku);
    
    Page<Product> findByCategoryId(UUID categoryId, Pageable pageable);
    
    Page<Product> findByNameContainingIgnoreCase(String name, Pageable pageable);

    Page<Product> findBySellerId(UUID sellerId, Pageable pageable);

    long countBySellerId(UUID sellerId);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.seller.id = :sellerId AND p.stockQuantity < :threshold")
    java.util.List<Product> findLowStockProducts(@org.springframework.data.repository.query.Param("sellerId") UUID sellerId, @org.springframework.data.repository.query.Param("threshold") int threshold);
}
