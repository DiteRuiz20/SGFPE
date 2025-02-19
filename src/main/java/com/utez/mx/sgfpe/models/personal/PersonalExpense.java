package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "personal_expenses") // MongoDB collection for personal expenses
public class PersonalExpense {

    @Id
    private ObjectId id; // Unique identifier for each expense

    private String userId; // ID of the user who made this expense
    private String categoryId; // ID of the category for this expense
    private Instant date; // Date of the expense
    private BigDecimal amount; // Amount spent
    private String description; // Description of the expense

    // Default constructor required by MongoDB
    public PersonalExpense() {
    }

    // Constructor with all attributes for easy instantiation
    public PersonalExpense(String userId, String categoryId, Instant date, BigDecimal amount, String description) {
        this.userId = userId;
        this.categoryId = categoryId;
        this.date = date;
        this.amount = amount;
        this.description = description;
    }
}
