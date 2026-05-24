package com.shopgenius.fraud.service;

import com.shopgenius.fraud.entity.FraudScore;
import com.shopgenius.fraud.repository.FraudScoreRepository;
import com.shopgenius.order.entity.Order;
import com.shopgenius.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FraudDetectionService {

    private final FraudScoreRepository fraudScoreRepository;

    public FraudScore evaluateOrderRisk(Order order) {
        User user = order.getUser();
        List<String> riskReasons = new ArrayList<>();
        double score = 0.0;

        // Rule 1: High order amount
        if (order.getTotalAmount().compareTo(BigDecimal.valueOf(5000)) > 0) {
            score += 40;
            riskReasons.add("Unusually high order amount (>" + 5000 + ")");
        } else if (order.getTotalAmount().compareTo(BigDecimal.valueOf(1000)) > 0) {
            score += 20;
            riskReasons.add("High order amount (>" + 1000 + ")");
        }

        // Rule 2: Failed login attempts on user account
        if (user.getFailedLoginAttempts() > 3) {
            score += 30;
            riskReasons.add("Multiple failed login attempts (" + user.getFailedLoginAttempts() + ")");
        }

        // Rule 3: Account age (if created recently, slight risk)
        if (user.getCreatedAt().plusDays(1).isAfter(order.getCreatedAt())) {
            score += 10;
            riskReasons.add("Account created very recently");
        }

        // Rule 4: Suspicious payment method (dummy rule)
        if (order.getPaymentMethod() == null) {
            score += 50;
            riskReasons.add("No payment method selected");
        }

        String riskLevel;
        if (score >= 70) {
            riskLevel = "HIGH";
        } else if (score >= 30) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "LOW";
        }

        FraudScore fraudScore = FraudScore.builder()
                .order(order)
                .user(user)
                .riskLevel(riskLevel)
                .score(BigDecimal.valueOf(score))
                .reasons(String.join("; ", riskReasons))
                .build();

        return fraudScoreRepository.save(fraudScore);
    }
}
