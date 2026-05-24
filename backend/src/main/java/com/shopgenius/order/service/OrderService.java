package com.shopgenius.order.service;

import com.shopgenius.cart.dto.CartDto;
import com.shopgenius.cart.entity.Coupon;
import com.shopgenius.cart.repository.CouponRepository;
import com.shopgenius.cart.service.CartService;
import com.shopgenius.exception.BusinessException;
import com.shopgenius.order.dto.OrderCreateDto;
import com.shopgenius.order.dto.OrderDto;
import com.shopgenius.order.entity.Order;
import com.shopgenius.order.entity.OrderItem;
import com.shopgenius.order.mapper.OrderMapper;
import com.shopgenius.order.repository.OrderRepository;
import com.shopgenius.product.entity.Product;
import com.shopgenius.product.repository.ProductRepository;
import com.shopgenius.user.entity.Address;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.AddressRepository;
import com.shopgenius.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import com.shopgenius.fraud.service.FraudDetectionService;
import com.shopgenius.cart.repository.AbandonedCartEventRepository;
import com.shopgenius.recommendation.service.RecommendationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final AddressRepository addressRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final OrderMapper orderMapper;
    private final FraudDetectionService fraudDetectionService;
    private final AbandonedCartEventRepository abandonedCartEventRepository;
    private final RecommendationService recommendationService;

    @Transactional
    public OrderDto placeOrder(UUID userId, OrderCreateDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));

        Address shippingAddress = addressRepository.findById(dto.getShippingAddressId())
                .orElseThrow(() -> new BusinessException("Shipping address not found", HttpStatus.NOT_FOUND));

        if (!shippingAddress.getUser().getId().equals(userId)) {
            throw new BusinessException("Address does not belong to user", HttpStatus.FORBIDDEN);
        }

        CartDto cart = cartService.getCart(userId, dto.getCouponCode());

        if (cart.getItems().isEmpty()) {
            throw new BusinessException("Cart is empty", HttpStatus.BAD_REQUEST);
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus("PENDING");
        order.setPaymentMethod(dto.getPaymentMethod());
        order.setTotalAmount(cart.getFinalAmount());
        order.setShippingAddress(shippingAddress);

        if (cart.getCouponCode() != null) {
            Coupon coupon = couponRepository.findByCode(cart.getCouponCode()).orElse(null);
            order.setCoupon(coupon);
        }

        // Create order items and reduce stock
        cart.getItems().forEach(cartItemDto -> {
            Product product = productRepository.findById(cartItemDto.getProductId())
                    .orElseThrow(() -> new BusinessException("Product not found", HttpStatus.NOT_FOUND));

            if (product.getStockQuantity() < cartItemDto.getQuantity()) {
                throw new BusinessException("Not enough stock for " + product.getName(), HttpStatus.BAD_REQUEST);
            }

            product.setStockQuantity(product.getStockQuantity() - cartItemDto.getQuantity());
            productRepository.save(product);

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItemDto.getQuantity());
            orderItem.setPrice(cartItemDto.getProductPrice());
            
            order.getOrderItems().add(orderItem);
        });

        Order savedOrder = orderRepository.save(order);
        
        // Evaluate fraud risk
        com.shopgenius.fraud.entity.FraudScore fraudScore = fraudDetectionService.evaluateOrderRisk(savedOrder);
        if ("HIGH".equals(fraudScore.getRiskLevel())) {
            throw new BusinessException("Order flagged as high risk. Please contact customer service.", HttpStatus.BAD_REQUEST);
        }

        // Recovery check: mark user's active abandoned cart events as recovered
        abandonedCartEventRepository.findFirstByUserIdAndIsRecoveredOrderByCreatedAtDesc(userId, false)
                .ifPresent(event -> {
                    event.setRecovered(true);
                    abandonedCartEventRepository.save(event);
                });

        // Log recommendation PURCHASED action for each item
        savedOrder.getOrderItems().forEach(item -> {
            recommendationService.logAction(user, item.getProduct(), "PURCHASED");
        });
        
        // Clear the user's cart
        cartService.clearCart(userId);

        return orderMapper.toDto(savedOrder);
    }

    public Page<OrderDto> getUserOrders(UUID userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable)
                .map(orderMapper::toDto);
    }

    public OrderDto getOrderById(UUID id, UUID userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));
        
        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Unauthorized to view this order", HttpStatus.FORBIDDEN);
        }

        return orderMapper.toDto(order);
    }

    @Transactional
    public OrderDto updateOrderStatus(UUID id, String status) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));
        
        order.setStatus(status);
        return orderMapper.toDto(orderRepository.save(order));
    }
}
