package com.shopgenius.payment.service;

import com.shopgenius.exception.BusinessException;
import com.shopgenius.order.entity.Order;
import com.shopgenius.order.repository.OrderRepository;
import com.shopgenius.payment.dto.PaymentRequestDto;
import com.shopgenius.payment.dto.PaymentResponseDto;
import com.shopgenius.payment.entity.Payment;
import com.shopgenius.payment.repository.PaymentRepository;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;

    @Transactional
    public PaymentResponseDto processPayment(UUID userId, PaymentRequestDto request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new BusinessException("Order not found", HttpStatus.NOT_FOUND));

        if (!order.getUser().getId().equals(userId)) {
            throw new BusinessException("Unauthorized to pay for this order", HttpStatus.FORBIDDEN);
        }

        if (!order.getStatus().equals("PENDING") && !order.getStatus().equals("FAILED")) {
            throw new BusinessException("Order cannot be paid for. Current status: " + order.getStatus(), HttpStatus.BAD_REQUEST);
        }

        // Mock payment logic
        boolean isSuccess = simulatePaymentGateway(request.getPaymentMethod(), order.getTotalAmount().doubleValue());
        
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        String paymentStatus = isSuccess ? "SUCCESS" : "FAILED";

        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(paymentStatus);
        payment.setTransactionId(isSuccess ? transactionId : null);

        payment = paymentRepository.save(payment);

        if (isSuccess) {
            order.setStatus("PAID");
            User user = order.getUser();
            int pointsEarned = order.getTotalAmount().divide(BigDecimal.valueOf(10)).intValue();
            if (pointsEarned > 0) {
                user.setLoyaltyPoints(user.getLoyaltyPoints() + pointsEarned);
                userRepository.save(user);
            }
        } else {
            order.setStatus("FAILED");
        }
        orderRepository.save(order);

        return PaymentResponseDto.builder()
                .paymentId(payment.getId())
                .orderId(order.getId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .transactionId(payment.getTransactionId())
                .message(isSuccess ? "Payment successful" : "Payment failed. Please try again.")
                .build();
    }

    private boolean simulatePaymentGateway(String paymentMethod, double amount) {
        // Mocked logic: 90% success rate, 10% failure rate
        return Math.random() > 0.1;
    }
}
