package com.shopgenius.recommendation.repository;

import com.shopgenius.recommendation.entity.RecommendationLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RecommendationLogRepository extends JpaRepository<RecommendationLog, UUID> {
}
