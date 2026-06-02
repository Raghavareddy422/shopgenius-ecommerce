package com.shopgenius.order.repository;

import com.shopgenius.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.seller.id = :sellerId AND oi.order.status IN ('PAID', 'SHIPPED', 'DELIVERED')")
    List<OrderItem> findCompletedSalesBySellerId(@Param("sellerId") UUID sellerId);

    @Query("SELECT oi FROM OrderItem oi WHERE oi.product.seller.id = :sellerId ORDER BY oi.createdAt DESC")
    List<OrderItem> findRecentSalesBySellerId(@Param("sellerId") UUID sellerId);
}
