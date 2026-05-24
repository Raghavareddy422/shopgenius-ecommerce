package com.shopgenius.user.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.user.dto.UserProfileDto;
import com.shopgenius.user.dto.UserUpdateDto;
import com.shopgenius.user.entity.User;
import com.shopgenius.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final com.shopgenius.user.repository.AddressRepository addressRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@AuthenticationPrincipal User user) {
        UserProfileDto profile = userService.getUserProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile fetched successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UserUpdateDto updateDto) {
            
        UserProfileDto profile = userService.updateUserProfile(user.getId(), updateDto);
        return ResponseEntity.ok(ApiResponse.success(profile, "User profile updated successfully"));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<java.util.List<com.shopgenius.user.entity.Address>>> getAddresses(@AuthenticationPrincipal User user) {
        java.util.List<com.shopgenius.user.entity.Address> addresses = addressRepository.findByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.success(addresses, "Addresses fetched successfully"));
    }

    @Transactional
    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<com.shopgenius.user.entity.Address>> addAddress(
            @AuthenticationPrincipal User user,
            @RequestBody com.shopgenius.user.entity.Address address) {
        address.setUser(user);
        if (address.isDefault()) {
            java.util.List<com.shopgenius.user.entity.Address> existing = addressRepository.findByUserId(user.getId());
            for (com.shopgenius.user.entity.Address addr : existing) {
                if (addr.isDefault()) {
                    addr.setDefault(false);
                    addressRepository.save(addr);
                }
            }
        }
        com.shopgenius.user.entity.Address savedAddress = addressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.success(savedAddress, "Address added successfully"));
    }
}
