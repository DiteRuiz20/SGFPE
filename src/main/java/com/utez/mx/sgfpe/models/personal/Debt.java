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

    private ObjectId userId; // ID of the user who owes this debt
    private String creditor; // Entity or person to whom the debt is owed
    private BigDecimal amount; // Amount of the debt
    private Instant dueDate; // Date by which the debt should be repaid
    private String status; // Status of the debt: "pending", "paid"

    // Default constructor required by MongoDB
    public Debt() {
    }

    // Constructor with all attributes for easy instantiation
    public Debt(ObjectId userId, String creditor, BigDecimal amount, Instant dueDate, String status) {
        this.userId = userId;
        this.creditor = creditor;
        this.amount = amount;
        this.dueDate = dueDate;
        this.status = status;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public ObjectId getUserId() {
        return userId;
    }

    public void setUserId(ObjectId userId) {
        this.userId = userId;
    }

    public String getCreditor() {
        return creditor;
    }

    public void setCreditor(String creditor) {
        this.creditor = creditor;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getDueDate() {
        return dueDate;
    }

    public void setDueDate(Instant dueDate) {
        this.dueDate = dueDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
