package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "debts") // MongoDB collection for debts
public class Debt {

    @Id
    private ObjectId id; // Unique identifier for each debt

    private String userId; // ID of the user who owes this debt
    private String creditor; // Entity or person to whom the debt is owed
    private BigDecimal amount; // Amount of the debt
    private Instant dueDate; // Date by which the debt should be repaid
    private String status; // Status of the debt: "pending", "paid"

    // Default constructor required by MongoDB
    public Debt() {
    }

    // Constructor with all attributes for easy instantiation
    public Debt(String userId, String creditor, BigDecimal amount, Instant dueDate, String status) {
        this.userId = userId;
        this.creditor = creditor;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
    }
}
