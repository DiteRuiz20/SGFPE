package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "raw_materials") // MongoDB collection for raw materials
public class RawMaterial {

    @Id
    private ObjectId id; // Unique identifier for each raw material

    private Instant entryDate; // Date when the raw material was received
    private String materialDescription; // Description of the raw material
    private String supplier; // Supplier of the raw material
    private double quantity; // Quantity of raw material acquired
    private String measurementUnit; // Unit of measurement (e.g., kg, liters)
    private BigDecimal unitPrice; // Price per unit of the raw material
    private String notes; // Additional notes

    // Default constructor required by MongoDB
    public RawMaterial() {
    }

    // Constructor with all attributes for easy instantiation
    public RawMaterial(Instant entryDate, String materialDescription, String supplier, double quantity, String measurementUnit, BigDecimal unitPrice, String notes) {
        this.entryDate = entryDate;
        this.materialDescription = materialDescription;
        this.supplier = supplier;
        this.quantity = quantity;
        this.measurementUnit = measurementUnit;
        this.unitPrice = unitPrice;
        this.notes = notes;
    }

    // Method to calculate total cost (unitPrice * quantity)
    public BigDecimal getTotal() {
        return unitPrice.multiply(BigDecimal.valueOf(quantity));
    }
}
