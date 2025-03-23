package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;
import org.bson.types.ObjectId;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "savings") // MongoDB collection for savings
public class Saving {

    @Id
    private String id; // Unique identifier for each saving

    private String userId; // ID of the user who saved this amount
    private BigDecimal amount; // Amount saved

    @CreatedDate
    private Instant date; // Date when the saving was made
    private String description; // Description or purpose of the saving

    // Default constructor required by MongoDB
    public Saving() {
    }

    // Constructor with all attributes for easy instantiation
    public Saving(String userId, BigDecimal amount, Instant date, String description) {
        this.userId = userId;
        this.amount = amount;
        this.date = date;
        this.description = description;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
