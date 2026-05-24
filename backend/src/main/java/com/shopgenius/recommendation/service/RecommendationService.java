package com.shopgenius.recommendation.service;

import com.shopgenius.product.entity.Product;
import com.shopgenius.recommendation.entity.RecommendationLog;
import com.shopgenius.recommendation.repository.RecommendationLogRepository;
import com.shopgenius.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final RecommendationLogRepository recommendationLogRepository;

    public void logAction(User user, Product product, String actionType) {
        RecommendationLog log = RecommendationLog.builder()
                .user(user)
                .product(product)
                .actionType(actionType)
                .build();
        recommendationLogRepository.save(log);
    }
}
