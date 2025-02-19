package com.utez.mx.sgfpe.controllers.personal;

import com.utez.mx.sgfpe.models.personal.Notification;
import com.utez.mx.sgfpe.services.personal.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal/notifications") // Base URL for notification-related endpoints
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    // Get all notifications
    @GetMapping
    public List<Notification> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    // Get notification by ID
    @GetMapping("/{id}")
    public ResponseEntity<Notification> getNotificationById(@PathVariable String id) {
        Optional<Notification> notification = notificationService.getNotificationById(id);
        return notification.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Get notifications by user ID
    @GetMapping("/user/{userId}")
    public List<Notification> getNotificationsByUser(@PathVariable String userId) {
        return notificationService.getNotificationsByUser(userId);
    }

    // Create a new notification
    @PostMapping
    public Notification createNotification(@RequestBody Notification notification) {
        return notificationService.saveOrUpdateNotification(notification);
    }

    // Update an existing notification
    @PutMapping("/{id}")
    public ResponseEntity<Notification> updateNotification(@PathVariable String id, @RequestBody Notification updatedNotification) {
        Optional<Notification> existingNotification = notificationService.getNotificationById(id);
        if (existingNotification.isPresent()) {
            updatedNotification.setId(existingNotification.get().getId());
            return ResponseEntity.ok(notificationService.saveOrUpdateNotification(updatedNotification));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a notification by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String id) {
        notificationService.deleteNotificationById(id);
        return ResponseEntity.noContent().build();
    }

    // Mark a notification as read
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }
}
