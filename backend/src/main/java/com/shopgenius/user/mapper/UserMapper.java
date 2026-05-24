package com.shopgenius.user.mapper;

import com.shopgenius.user.dto.UserProfileDto;
import com.shopgenius.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {
    UserProfileDto toDto(User user);
}
