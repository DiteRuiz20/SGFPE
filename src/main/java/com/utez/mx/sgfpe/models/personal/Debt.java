package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;
import org.bson.types.ObjectId;
import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "debts") // MongoDB collection for debts
public class Debt {

    @Id
    private String id; // Unique identifier for each debt

    private String userId; // ID of the user who owes this debt
    private String creditor; // Entity or person to whom the debt is owed
    private BigDecimal amount; // Amount of the debt
    @CreatedDate
    private Instant date; // Date when the debt was created
    private DebtStatus status; // Status of the debt: PENDING, PAID, OVERDUE, CANCELLED

    // Default constructor required by MongoDB
    public Debt() {
    }

    // Constructor with all attributes for easy instantiation
    public Debt(String userId, String creditor, BigDecimal amount, Instant date, DebtStatus status) {
        this.userId = userId;
        this.creditor = creditor;
        this.amount = amount;
        this.date = date;
        this.status = status;
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

    public DebtStatus getStatus() {
        return status;
    }

    public void setStatus(DebtStatus status) {
        this.status = status;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }
}
