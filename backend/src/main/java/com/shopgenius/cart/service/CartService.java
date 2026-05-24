package com.shopgenius.cart.service;

import com.shopgenius.cart.dto.CartDto;
import com.shopgenius.cart.dto.CartItemAddDto;
import com.shopgenius.cart.dto.CartItemDto;
import com.shopgenius.cart.entity.CartItem;
import com.shopgenius.cart.entity.Coupon;
import com.shopgenius.cart.mapper.CartItemMapper;
import com.shopgenius.cart.repository.CartItemRepository;
import com.shopgenius.cart.repository.CouponRepository;
import com.shopgenius.exception.BusinessException;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import com.shopgenius.negotiation.repository.NegotiationLogRepository;
import com.shopgenius.negotiation.entity.NegotiationLog;
import com.shopgenius.cart.repository.AbandonedCartEventRepository;
import com.shopgenius.cart.service.SmartCartRecoveryService;
import com.shopgenius.notification.service.NotificationService;
import com.shopgenius.recommendation.service.RecommendationService;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final CouponRepository couponRepository;
    private final CartItemMapper cartItemMapper;
    private final NegotiationLogRepository negotiationLogRepository;
    private final AbandonedCartEventRepository abandonedCartEventRepository;
    private final SmartCartRecoveryService smartCartRecoveryService;
    private final NotificationService notificationService;
    private final RecommendationService recommendationService;

    @Transactional
    public CartDto addItemToCart(UUID userId, CartItemAddDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));

        Product product = productRepository.findById(dto.getProductId())
                .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

        if (product.getStockQuantity() < dto.getQuantity()) {
            throw new BusinessException("Not enough stock available", HttpStatus.BAD_REQUEST);
        }

        Optional<CartItem> existingItem = cartItemRepository.findByUserIdAndProductId(userId, dto.getProductId());

        if (existingItem.isPresent()) {
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + dto.getQuantity();
            if (product.getStockQuantity() < newQuantity) {
                throw new BusinessException("Not enough stock available", HttpStatus.BAD_REQUEST);
            }
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        } else {
            CartItem cartItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(dto.getQuantity())
                    .build();
            cartItemRepository.save(cartItem);
        }

        recommendationService.logAction(user, product, "ADDED_TO_CART");

        return getCart(userId, null);
    }

    @Transactional
    public CartDto updateItemQuantity(UUID userId, UUID itemId, int quantity) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BusinessException("Unauthorized to modify this cart", HttpStatus.FORBIDDEN);
        }

        if (quantity <= 0) {
            cartItemRepository.delete(cartItem);
        } else {
            if (cartItem.getProduct().getStockQuantity() < quantity) {
                throw new BusinessException("Not enough stock available", HttpStatus.BAD_REQUEST);
            }
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);
        }

        return getCart(userId, null);
    }

    @Transactional
    public CartDto removeItemFromCart(UUID userId, UUID itemId) {
        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new BusinessException("Cart item not found", HttpStatus.NOT_FOUND));

        if (!cartItem.getUser().getId().equals(userId)) {
            throw new BusinessException("Unauthorized to modify this cart", HttpStatus.FORBIDDEN);
        }

        cartItemRepository.delete(cartItem);
        return getCart(userId, null);
    }

    @Transactional
    public void clearCart(UUID userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    @Transactional
    public CartDto getCart(UUID userId, String couponCode) {
        List<CartItem> cartItems = cartItemRepository.findByUserId(userId);
        
        List<CartItemDto> itemDtos = cartItems.stream()
                .map(item -> {
                    CartItemDto dto = cartItemMapper.toDto(item);
                    Optional<NegotiationLog> acceptedNego = negotiationLogRepository
                            .findFirstByUserIdAndProductIdAndStatusOrderByCreatedAtDesc(userId, item.getProduct().getId(), "ACCEPTED");
                    if (acceptedNego.isPresent()) {
                        BigDecimal negoPrice = acceptedNego.get().getOfferedPrice();
                        dto.setProductPrice(negoPrice);
                        dto.setSubTotal(negoPrice.multiply(BigDecimal.valueOf(item.getQuantity())));
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        BigDecimal totalAmount = itemDtos.stream()
                .map(CartItemDto::getSubTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal discountAmount = BigDecimal.ZERO;
        String appliedCouponCode = null;

        if (couponCode != null && !couponCode.isEmpty()) {
            Coupon coupon = couponRepository.findByCode(couponCode)
                    .orElseThrow(() -> new BusinessException("Invalid coupon code", HttpStatus.BAD_REQUEST));

            if (!coupon.isActive() || coupon.getExpiryDate().isBefore(LocalDateTime.now())) {
                throw new BusinessException("Coupon is expired or inactive", HttpStatus.BAD_REQUEST);
            }

            if (coupon.getMinOrderAmount() != null && totalAmount.compareTo(coupon.getMinOrderAmount()) < 0) {
                throw new BusinessException("Minimum order amount not reached for this coupon", HttpStatus.BAD_REQUEST);
            }

            if (coupon.getDiscountAmount() != null) {
                discountAmount = coupon.getDiscountAmount();
            } else if (coupon.getDiscountPercentage() != null) {
                discountAmount = totalAmount.multiply(coupon.getDiscountPercentage()).divide(BigDecimal.valueOf(100));
            }
            
            appliedCouponCode = coupon.getCode();
        }

        BigDecimal finalAmount = totalAmount.subtract(discountAmount);
        if (finalAmount.compareTo(BigDecimal.ZERO) < 0) {
            finalAmount = BigDecimal.ZERO;
        }

        // Smart Cart Recovery logic
        if (!cartItems.isEmpty()) {
            boolean hasActiveRecovery = abandonedCartEventRepository.existsByUserIdAndIsRecovered(userId, false);
            if (!hasActiveRecovery) {
                User user = userRepository.findById(userId).orElse(null);
                if (user != null) {
                    smartCartRecoveryService.trackAbandonedCart(user, totalAmount);
                    notificationService.createNotification(user, "Abandoned Cart Recovery", "We noticed you left items in your cart! Use coupon RECOVERY15 to get 15% OFF your purchase!");
                }
            }
        }

        return CartDto.builder()
                .items(itemDtos)
                .totalAmount(totalAmount)
                .discountAmount(discountAmount)
                .finalAmount(finalAmount)
                .couponCode(appliedCouponCode)
                .build();
    }
}
