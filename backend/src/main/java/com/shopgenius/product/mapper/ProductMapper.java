package com.shopgenius.product.mapper;

import com.shopgenius.product.dto.ProductDto;
import com.shopgenius.product.entity.Product;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    @Mapping(source = "category.id", target = "categoryId")
    @Mapping(source = "category.name", target = "categoryName")
    @Mapping(source = "seller.id", target = "sellerId")
    @Mapping(expression = "java(product.getSeller() != null ? product.getSeller().getFirstName() + \" \" + product.getSeller().getLastName() : \"ShopGenius\")", target = "sellerName")
    ProductDto toDto(Product product);
}
