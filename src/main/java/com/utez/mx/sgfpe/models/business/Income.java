package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "business_incomes") // MongoDB collection for incomes
public class Income {

    @Id
    private ObjectId id; // Unique identifier for the income

    private String companyId; // ID of the company receiving this income
    private Instant date; // Date the income was received
    private BigDecimal amount; // Amount of income received
    private String source; // Source of income (e.g., sales, services)

    // Default constructor required by MongoDB
    public Income() {
    }

    // Constructor with all attributes for easy instantiation
    public Income(String companyId, Instant date, BigDecimal amount, String source) {
        this.companyId = companyId;
        this.date = date;
        this.amount = amount;
        this.source = source;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public Instant getDate() {
        return date;
    }

    public void setDate(Instant date) {
        this.date = date;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
