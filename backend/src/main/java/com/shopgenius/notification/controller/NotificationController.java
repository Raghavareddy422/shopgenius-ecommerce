package com.shopgenius.notification.controller;

import com.shopgenius.common.dto.ApiResponse;
import com.shopgenius.notification.entity.Notification;
import com.shopgenius.notification.service.NotificationService;
import com.shopgenius.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getUserNotifications(@AuthenticationPrincipal User user) {
        List<Notification> notifications = notificationService.getUserNotifications(user.getId());
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications fetched successfully"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Notification>> markAsRead(
            @PathVariable UUID id,
            @AuthenticationPrincipal User user) {
        Notification notification = notificationService.markAsRead(id, user.getId());
        return ResponseEntity.ok(ApiResponse.success(notification, "Notification marked as read successfully"));
    }
}
