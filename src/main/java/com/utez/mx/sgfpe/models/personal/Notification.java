package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;
import java.time.Instant;

@Data
@Document(collection = "notifications") // MongoDB collection for notifications
public class Notification {

    @Id
    private ObjectId id; // Unique identifier for each notification

    private String userId; // ID of the user receiving the notification
    private String message; // Notification message content
    private Instant notifyDate; // Date and time to notify the user
    private boolean isRead; // Status of the notification: true if read, false if unread

    // Default constructor required by MongoDB
    public Notification() {
    }

    // Constructor with all attributes for easy instantiation
    public Notification(String userId, String message, Instant notifyDate, boolean isRead) {
        this.userId = userId;
        this.message = message;
        this.notifyDate = notifyDate;
        this.isRead = isRead;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getNotifyDate() {
        return notifyDate;
    }

    public void setNotifyDate(Instant notifyDate) {
        this.notifyDate = notifyDate;
    }

    public boolean isRead() {
        return isRead;
    }

    public void setRead(boolean read) {
        isRead = read;
    }
}
