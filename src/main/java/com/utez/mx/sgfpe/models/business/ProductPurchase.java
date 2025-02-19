package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "product_purchases") // MongoDB collection for product purchases
public class ProductPurchase {

    @Id
    private ObjectId id; // Unique identifier for each product purchase

    private Instant purchaseDate; // Date when the product was purchased
    private String productDescription; // Description of the product
    private double acquiredQuantity; // Quantity acquired
    private BigDecimal unitCost; // Cost per unit of the product
    private String category; // Category of the product
    private String purchaseMethod; // Method of payment (e.g., cash, credit)
    private String notes; // Additional notes

    // Default constructor required by MongoDB
    public ProductPurchase() {
    }

    // Constructor with all attributes for easy instantiation
    public ProductPurchase(Instant purchaseDate, String productDescription, double acquiredQuantity, BigDecimal unitCost, String category, String purchaseMethod, String notes) {
        this.purchaseDate = purchaseDate;
        this.productDescription = productDescription;
        this.acquiredQuantity = acquiredQuantity;
        this.unitCost = unitCost;
        this.category = category;
        this.purchaseMethod = purchaseMethod;
        this.notes = notes;
    }

    // Method to calculate total cost (unitCost * acquiredQuantity)
    public BigDecimal getTotalCost() {
        return unitCost.multiply(BigDecimal.valueOf(acquiredQuantity));
    }
}
