package com.shopgenius.product.service;

import com.shopgenius.exception.BusinessException;
import com.shopgenius.product.entity.PriceWatch;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.repository.PriceWatchRepository;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PriceWatchService {

    private final PriceWatchRepository priceWatchRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public PriceWatch subscribeToPriceDrop(UUID userId, UUID productId, BigDecimal targetPrice) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        PriceWatch priceWatch = PriceWatch.builder()
                .user(user)
                .product(product)
                .targetPrice(targetPrice)
                .isActive(true)
                .build();

        return priceWatchRepository.save(priceWatch);
    }

    public java.util.List<PriceWatch> getUserSubscriptions(UUID userId) {
        return priceWatchRepository.findByUserId(userId);
    }

    @org.springframework.transaction.annotation.Transactional
    public void unsubscribe(UUID subscriptionId, UUID userId) {
        PriceWatch priceWatch = priceWatchRepository.findById(subscriptionId)
                .orElseThrow(() -> new BusinessException("Subscription not found", HttpStatus.NOT_FOUND));

        if (!priceWatch.getUser().getId().equals(userId)) {
            throw new BusinessException("Unauthorized to modify this subscription", HttpStatus.FORBIDDEN);
        }

        priceWatchRepository.delete(priceWatch);
    }
}
