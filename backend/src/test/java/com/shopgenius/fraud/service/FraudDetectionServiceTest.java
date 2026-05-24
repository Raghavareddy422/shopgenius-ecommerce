package com.shopgenius.fraud.service;

import com.shopgenius.fraud.entity.FraudScore;
import com.shopgenius.fraud.repository.FraudScoreRepository;
import com.shopgenius.order.entity.Order;
import com.shopgenius.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class FraudDetectionServiceTest {

    @Mock
    private FraudScoreRepository fraudScoreRepository;

    @InjectMocks
    private FraudDetectionService fraudDetectionService;

    private User user;
    private Order order;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .failedLoginAttempts(0)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();

        order = Order.builder()
                .user(user)
                .totalAmount(BigDecimal.valueOf(100))
                .paymentMethod("CREDIT_CARD")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testEvaluateOrderRisk_LowRisk() {
        when(fraudScoreRepository.save(any(FraudScore.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FraudScore result = fraudDetectionService.evaluateOrderRisk(order);

        assertEquals("LOW", result.getRiskLevel());
        assertEquals(BigDecimal.valueOf(0.0), result.getScore());
    }

    @Test
    void testEvaluateOrderRisk_HighAmountMediumRisk() {
        order.setTotalAmount(BigDecimal.valueOf(1500)); // triggers >1000 rule (+20)
        user.setFailedLoginAttempts(4); // triggers failed login rule (+30) -> total 50 (MEDIUM)

        when(fraudScoreRepository.save(any(FraudScore.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FraudScore result = fraudDetectionService.evaluateOrderRisk(order);

        assertEquals("MEDIUM", result.getRiskLevel());
        assertEquals(BigDecimal.valueOf(50.0), result.getScore());
    }

    @Test
    void testEvaluateOrderRisk_HighRisk() {
        order.setTotalAmount(BigDecimal.valueOf(6000)); // triggers >5000 rule (+40)
        user.setFailedLoginAttempts(5); // triggers failed login rule (+30)
        order.setPaymentMethod(null); // triggers no payment method (+50) -> total 120 (HIGH)

        when(fraudScoreRepository.save(any(FraudScore.class))).thenAnswer(invocation -> invocation.getArgument(0));

        FraudScore result = fraudDetectionService.evaluateOrderRisk(order);

        assertEquals("HIGH", result.getRiskLevel());
        assertEquals(BigDecimal.valueOf(120.0), result.getScore());
    }
}
