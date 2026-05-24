package com.shopgenius.notification.service;

import com.shopgenius.exception.BusinessException;
import com.shopgenius.notification.entity.Notification;
import com.shopgenius.notification.repository.NotificationRepository;
import com.shopgenius.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    @Transactional
    public Notification createNotification(User user, String title, String message) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .isRead(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Transactional(readOnly = true)
    public List<Notification> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public Notification markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new BusinessException("Notification not found", HttpStatus.NOT_FOUND));

        if (!notification.getUser().getId().equals(userId)) {
            throw new BusinessException("Unauthorized to modify this notification", HttpStatus.FORBIDDEN);
        }

        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
