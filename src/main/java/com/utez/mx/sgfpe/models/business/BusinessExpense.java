package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "business_expenses") // MongoDB collection for business expenses
public class BusinessExpense {

    @Id
    ObjectId id; // Unique identifier for each expense

    private String companyId; // ID of the company that incurred this expense
    private String description; // Description of the expense
    private Instant date; // Date of the expense
    private BigDecimal amount; // Amount of the expense
    private String category; // Category of the expense (e.g., supplies, utilities)

    // Default constructor required by MongoDB
    public BusinessExpense() {
    }

    // Constructor with all attributes for easy creation of expense objects
    public BusinessExpense(String companyId, String description, Instant date, BigDecimal amount, String category) {
        this.companyId = companyId;
        this.description = description;
        this.date = date;
        this.amount = amount;
        this.category = category;
    }
}
