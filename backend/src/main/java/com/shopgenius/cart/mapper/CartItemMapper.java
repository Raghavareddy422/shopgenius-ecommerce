package com.shopgenius.cart.mapper;

import com.shopgenius.cart.dto.CartItemDto;
import com.shopgenius.cart.entity.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

import java.math.BigDecimal;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CartItemMapper {

    @Mapping(source = "product.id", target = "productId")
    @Mapping(source = "product.name", target = "productName")
    @Mapping(source = "product.imageUrl", target = "productImageUrl")
    @Mapping(source = "product.price", target = "productPrice")
    @Mapping(source = ".", target = "subTotal", qualifiedByName = "calculateSubTotal")
    CartItemDto toDto(CartItem cartItem);

    @Named("calculateSubTotal")
    default BigDecimal calculateSubTotal(CartItem cartItem) {
        if (cartItem.getProduct() != null && cartItem.getProduct().getPrice() != null) {
            return cartItem.getProduct().getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()));
        }
        return BigDecimal.ZERO;
    }
}
