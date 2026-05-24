package com.shopgenius.cart.repository;

import com.shopgenius.cart.entity.AbandonedCartEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AbandonedCartEventRepository extends JpaRepository<AbandonedCartEvent, UUID> {
    boolean existsByUserIdAndIsRecovered(UUID userId, boolean isRecovered);
    Optional<AbandonedCartEvent> findFirstByUserIdAndIsRecoveredOrderByCreatedAtDesc(UUID userId, boolean isRecovered);
}
