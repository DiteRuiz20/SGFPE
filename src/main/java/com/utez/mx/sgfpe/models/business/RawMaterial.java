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
    private String id; // Unique identifier for each raw material

    private String userId; // ID of the user who owns this raw material
    private Instant entryDate; // Date when the raw material was received
    private String materialDescription; // Description of the raw material
    private String supplier; // Supplier of the raw material
    private double quantity; // Quantity of raw material acquired
    private String measurementUnit; // Unidad de medida (e.g., kg, litros)
    private BigDecimal unitPrice; // Price per unit of the raw material
    private String notes; // Additional notes

    // Default constructor required by MongoDB
    public RawMaterial() {
    }

    // Constructor with all attributes for easy instantiation
    public RawMaterial(String userId, Instant entryDate, String materialDescription, String supplier, double quantity, String measurementUnit, BigDecimal unitPrice, String notes) {
        this.userId = userId;
        this.entryDate = entryDate;
        this.materialDescription = materialDescription;
        this.supplier = supplier;
        this.quantity = quantity;
        this.measurementUnit = measurementUnit;
        this.unitPrice = unitPrice;
        this.notes = notes;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Instant getEntryDate() {
        return entryDate;
    }

    public void setEntryDate(Instant entryDate) {
        this.entryDate = entryDate;
    }

    public String getMaterialDescription() {
        return materialDescription;
    }

    public void setMaterialDescription(String materialDescription) {
        this.materialDescription = materialDescription;
    }

    public String getSupplier() {
        return supplier;
    }

    public void setSupplier(String supplier) {
        this.supplier = supplier;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public String getMeasurementUnit() {
        return measurementUnit;
    }

    public void setMeasurementUnit(String measurementUnit) {
        this.measurementUnit = measurementUnit;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }
}
