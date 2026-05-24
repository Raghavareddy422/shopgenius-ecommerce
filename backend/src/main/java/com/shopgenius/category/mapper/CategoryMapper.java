package com.shopgenius.category.mapper;

import com.shopgenius.category.dto.CategoryDto;
import com.shopgenius.category.entity.Category;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    @Mapping(source = "parent.id", target = "parentId")
    CategoryDto toDto(Category category);
}
