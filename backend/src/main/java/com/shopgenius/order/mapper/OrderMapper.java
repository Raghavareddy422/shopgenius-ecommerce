package com.shopgenius.order.mapper;

import com.shopgenius.order.dto.OrderDto;
import com.shopgenius.order.dto.OrderItemDto;
import com.shopgenius.order.entity.Order;
import com.shopgenius.order.entity.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrderMapper {

    @Mapping(source = "shippingAddress.id", target = "shippingAddressId")
    @Mapping(source = "coupon.code", target = "couponCode")
    @Mapping(source = "orderItems", target = "items")
    OrderDto toDto(Order order);

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    OrderItemDto toItemDto(OrderItem item);
}
