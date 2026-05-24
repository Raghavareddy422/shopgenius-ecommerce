package com.shopgenius.negotiation.service;

import com.shopgenius.negotiation.dto.NegotiationRequestDto;
import com.shopgenius.negotiation.dto.NegotiationResponseDto;
import com.shopgenius.negotiation.entity.NegotiationLog;
import com.shopgenius.negotiation.repository.NegotiationLogRepository;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class NegotiationServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NegotiationLogRepository negotiationLogRepository;

    @InjectMocks
    private NegotiationService negotiationService;

    private User user;
    private Product product;
    private UUID userId;
    private UUID productId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        productId = UUID.randomUUID();

        user = User.builder().id(userId).loyaltyPoints(500).build();

        product = Product.builder()
                .id(productId)
                .price(BigDecimal.valueOf(100.00))
                .costPrice(BigDecimal.valueOf(70.00))
                .stockQuantity(50)
                .build();
    }

    @Test
    void testNegotiate_Accepted() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(negotiationLogRepository.save(any(NegotiationLog.class))).thenAnswer(i -> i.getArgument(0));

        NegotiationRequestDto request = new NegotiationRequestDto(productId, BigDecimal.valueOf(95.00));
        
        // 95 is within the 10% acceptable discount of 100
        NegotiationResponseDto response = negotiationService.negotiate(userId, request);

        assertEquals("ACCEPTED", response.getStatus());
        assertEquals(BigDecimal.valueOf(95.00), response.getOfferedPrice());
    }

    @Test
    void testNegotiate_Rejected() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(negotiationLogRepository.save(any(NegotiationLog.class))).thenAnswer(i -> i.getArgument(0));

        // Offer is too low, counter offer will be evaluated
        // lowest acceptable is 90. Offered is 50. Counter = (50+90)/2 = 70. 
        NegotiationRequestDto request = new NegotiationRequestDto(productId, BigDecimal.valueOf(50.00));
        
        NegotiationResponseDto response = negotiationService.negotiate(userId, request);

        assertEquals("COUNTER_OFFERED", response.getStatus());
    }
}
