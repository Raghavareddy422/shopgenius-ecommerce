package com.shopgenius.user.service;

import com.shopgenius.exception.BusinessException;
import com.shopgenius.user.dto.UserProfileDto;
import com.shopgenius.user.dto.UserUpdateDto;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.mapper.UserMapper;
import com.shopgenius.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    public UserProfileDto getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));
        return userMapper.toDto(user);
    }

    public UserProfileDto updateUserProfile(UUID userId, UserUpdateDto updateDto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException("User not found", HttpStatus.NOT_FOUND));

        user.setFirstName(updateDto.getFirstName());
        user.setLastName(updateDto.getLastName());
        user.setPhoneNumber(updateDto.getPhoneNumber());

        userRepository.save(user);
        return userMapper.toDto(user);
    }
}
