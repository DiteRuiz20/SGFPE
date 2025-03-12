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

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public Instant getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(Instant purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public double getAcquiredQuantity() {
        return acquiredQuantity;
    }

    public void setAcquiredQuantity(double acquiredQuantity) {
        this.acquiredQuantity = acquiredQuantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getPurchaseMethod() {
        return purchaseMethod;
    }

    public void setPurchaseMethod(String purchaseMethod) {
        this.purchaseMethod = purchaseMethod;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
