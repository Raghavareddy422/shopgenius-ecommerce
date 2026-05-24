package com.shopgenius.product.repository;

import com.shopgenius.product.entity.PriceWatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PriceWatchRepository extends JpaRepository<PriceWatch, UUID> {
    List<PriceWatch> findByUserId(UUID userId);
    List<PriceWatch> findByProductIdAndIsActive(UUID productId, boolean isActive);
}
