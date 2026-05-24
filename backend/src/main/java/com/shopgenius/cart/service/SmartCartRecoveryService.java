package com.shopgenius.cart.service;

import com.shopgenius.cart.entity.AbandonedCartEvent;
import com.shopgenius.cart.repository.AbandonedCartEventRepository;
import com.shopgenius.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class SmartCartRecoveryService {

    private final AbandonedCartEventRepository abandonedCartEventRepository;

    public void trackAbandonedCart(User user, BigDecimal cartValue) {
        String incentive = "10% OFF if you complete your purchase today!";
        
        AbandonedCartEvent event = AbandonedCartEvent.builder()
                .user(user)
                .cartValue(cartValue)
                .incentiveOffered(incentive)
                .isRecovered(false)
                .build();
                
        abandonedCartEventRepository.save(event);
    }
}
