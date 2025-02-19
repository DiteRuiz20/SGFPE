package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "savings") // MongoDB collection for savings
public class Saving {

    @Id
    private ObjectId id; // Unique identifier for each saving

    private String userId; // ID of the user who saved this amount
    private BigDecimal amount; // Amount saved
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
}
