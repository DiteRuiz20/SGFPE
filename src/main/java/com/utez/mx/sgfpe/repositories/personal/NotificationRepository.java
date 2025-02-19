package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface NotificationRepository extends MongoRepository<Notification, String> {
    // Find notifications by user ID
    List<Notification> findByUserId(String userId);

    // Find unread notifications for a user
    List<Notification> findByUserIdAndIsReadFalse(String userId);

    // Find notifications within a date range
    List<Notification> findByNotifyDateBetween(Instant startDate, Instant endDate);
}
