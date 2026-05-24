package com.shopgenius.negotiation.service;

import com.shopgenius.exception.BusinessException;
import com.shopgenius.negotiation.dto.NegotiationRequestDto;
import com.shopgenius.negotiation.dto.NegotiationResponseDto;
import com.shopgenius.negotiation.entity.NegotiationLog;
import com.shopgenius.negotiation.repository.NegotiationLogRepository;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NegotiationService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final NegotiationLogRepository negotiationLogRepository;

    @Transactional
    public NegotiationResponseDto negotiate(UUID userId, NegotiationRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        BigDecimal originalPrice = product.getPrice();
        BigDecimal costPrice = product.getCostPrice() != null ? product.getCostPrice() : originalPrice.multiply(BigDecimal.valueOf(0.7)); // Default 30% margin
        BigDecimal offeredPrice = request.getOfferedPrice();

        // Reject lowball offers below 50% of the retail price
        if (offeredPrice.compareTo(originalPrice.multiply(BigDecimal.valueOf(0.5))) < 0) {
            return saveLogAndRespond(user, product, originalPrice, offeredPrice, null, "REJECTED", 
                String.format("I'm sorry, ₹%s is too far below our margins. We cannot accept this price.", 
                    offeredPrice.setScale(2, RoundingMode.HALF_UP)));
        }

        if (offeredPrice.compareTo(originalPrice) >= 0) {
            return saveLogAndRespond(user, product, originalPrice, offeredPrice, null, "ACCEPTED", 
                String.format("Deal! Your offer of ₹%s is accepted. Proceed to checkout to secure your purchase!", 
                    offeredPrice.setScale(2, RoundingMode.HALF_UP)));
        }

        // Fetch bargaining history
        java.util.List<NegotiationLog> previousLogs = negotiationLogRepository.findByUserIdAndProductIdOrderByCreatedAtDesc(userId, product.getId());
        
        BigDecimal prevCounter = null;
        BigDecimal prevOffer = null;
        int roundCount = 0;
        
        if (previousLogs != null && !previousLogs.isEmpty()) {
            roundCount = previousLogs.size();
            for (NegotiationLog log : previousLogs) {
                if ("COUNTER_OFFERED".equals(log.getStatus())) {
                    if (prevCounter == null) {
                        prevCounter = log.getCounterPrice();
                    }
                    if (prevOffer == null) {
                        prevOffer = log.getOfferedPrice();
                    }
                }
            }
        }

        // Validate if the new bid is higher than the user's previous bid in the session
        if (prevOffer != null && offeredPrice.compareTo(prevOffer) <= 0) {
            return saveLogAndRespond(user, product, originalPrice, offeredPrice, prevCounter, "COUNTER_OFFERED", 
                String.format("Your offer of ₹%s is not higher than your previous offer of ₹%s. Please increase your offer to negotiate further.", 
                    offeredPrice.setScale(2, RoundingMode.HALF_UP), 
                    prevOffer.setScale(2, RoundingMode.HALF_UP)));
        }

        // Evaluate lowest acceptable price based on loyalty and margin
        double maxAllowedDiscount = 0.10; // Base 10%
        if (user.getLoyaltyPoints() > 1000) {
            maxAllowedDiscount += 0.05; // Extra 5% for loyal users
        }
        if (product.getStockQuantity() > 100) {
            maxAllowedDiscount += 0.05; // Extra 5% to clear stock
        }
        BigDecimal lowestAcceptablePrice = originalPrice.multiply(BigDecimal.valueOf(1 - maxAllowedDiscount));
        BigDecimal minimumMarginPrice = costPrice.multiply(BigDecimal.valueOf(1.05)); // 5% minimum margin
        if (lowestAcceptablePrice.compareTo(minimumMarginPrice) < 0) {
            lowestAcceptablePrice = minimumMarginPrice;
        }

        // If the user's offered price meets our floor, accept it!
        if (offeredPrice.compareTo(lowestAcceptablePrice) >= 0) {
            return saveLogAndRespond(user, product, originalPrice, offeredPrice, null, "ACCEPTED", 
                String.format("That works for us! Your negotiated price of ₹%s is accepted.", 
                    offeredPrice.setScale(2, RoundingMode.HALF_UP)));
        }

        // Calculate counter offer
        BigDecimal counterPrice;
        if (prevCounter != null) {
            // compromise halfway between user's new bid and previous counter
            BigDecimal candidateCounter = offeredPrice.add(prevCounter).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);
            counterPrice = candidateCounter.max(lowestAcceptablePrice);
        } else {
            // first round counter offer halfway between user's bid and original price
            BigDecimal candidateCounter = offeredPrice.add(originalPrice).divide(BigDecimal.valueOf(2), RoundingMode.HALF_UP);
            counterPrice = candidateCounter.max(lowestAcceptablePrice);
        }

        // Declare final offer on the 4th consecutive round
        if (roundCount >= 3) { // 3 previous attempts + current = 4th round
            counterPrice = lowestAcceptablePrice;
            return saveLogAndRespond(user, product, originalPrice, offeredPrice, counterPrice, "COUNTER_OFFERED", 
                String.format("This is our final offer. We cannot accept your offer of ₹%s, but how about ₹%s?", 
                    offeredPrice.setScale(2, RoundingMode.HALF_UP), 
                    counterPrice.setScale(2, RoundingMode.HALF_UP)));
        }

        return saveLogAndRespond(user, product, originalPrice, offeredPrice, counterPrice, "COUNTER_OFFERED", 
            String.format("We cannot accept your offer of ₹%s, but how about ₹%s?", 
                offeredPrice.setScale(2, RoundingMode.HALF_UP), 
                counterPrice.setScale(2, RoundingMode.HALF_UP)));
    }

    @Transactional
    public void accept(UUID userId, NegotiationRequestDto request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        NegotiationLog log = NegotiationLog.builder()
                .user(user)
                .product(product)
                .offeredPrice(request.getOfferedPrice())
                .status("ACCEPTED")
                .build();
        negotiationLogRepository.save(log);
    }

    private NegotiationResponseDto saveLogAndRespond(User user, Product product, BigDecimal originalPrice, BigDecimal offeredPrice, BigDecimal counterPrice, String status, String message) {
        NegotiationLog log = NegotiationLog.builder()
                .user(user)
                .product(product)
                .offeredPrice(offeredPrice)
                .counterPrice(counterPrice)
                .status(status)
                .build();
        negotiationLogRepository.save(log);

        return NegotiationResponseDto.builder()
                .status(status)
                .originalPrice(originalPrice)
                .offeredPrice(offeredPrice)
                .counterPrice(counterPrice)
                .message(message)
                .build();
    }
}
