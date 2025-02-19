package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.Notification;
import com.utez.mx.sgfpe.repositories.personal.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Get all notifications
    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    // Get notification by ID
    public Optional<Notification> getNotificationById(String id) {
        return notificationRepository.findById(id);
    }

    // Get notifications by user ID
    public List<Notification> getNotificationsByUser(String userId) {
        return notificationRepository.findByUserId(userId);
    }

    // Get unread notifications for a user
    public List<Notification> getUnreadNotificationsByUser(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId);
    }

    // Get notifications by date range
    public List<Notification> getNotificationsByDateRange(Instant startDate, Instant endDate) {
        return notificationRepository.findByNotifyDateBetween(startDate, endDate);
    }

    // Save or update a notification
    public Notification saveOrUpdateNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    // Delete notification by ID
    public void deleteNotificationById(String id) {
        notificationRepository.deleteById(id);
    }

    // Mark a notification as read
    public void markAsRead(String id) {
        Optional<Notification> notificationOpt = notificationRepository.findById(id);
        if (notificationOpt.isPresent()) {
            Notification notification = notificationOpt.get();
            notification.setRead(true);
            notificationRepository.save(notification);
        }
    }
}
