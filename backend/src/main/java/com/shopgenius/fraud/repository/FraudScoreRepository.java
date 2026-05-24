package com.shopgenius.fraud.repository;

import com.shopgenius.fraud.entity.FraudScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FraudScoreRepository extends JpaRepository<FraudScore, UUID> {
}
