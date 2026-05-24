package com.shopgenius.negotiation.repository;

import com.shopgenius.negotiation.entity.NegotiationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface NegotiationLogRepository extends JpaRepository<NegotiationLog, UUID> {
    Optional<NegotiationLog> findFirstByUserIdAndProductIdAndStatusOrderByCreatedAtDesc(UUID userId, UUID productId, String status);
    java.util.List<NegotiationLog> findByUserIdAndProductIdOrderByCreatedAtDesc(UUID userId, UUID productId);
}
