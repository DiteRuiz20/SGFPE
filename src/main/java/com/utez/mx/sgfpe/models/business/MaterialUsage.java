package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "material_usages")
public class MaterialUsage {

    @Id
    private String id;

    private String rawMaterialId; // Referencia a la materia prima consumida
    private String userId;
    private String usageDescription; // Ejemplo: "Insumo para playeras"
    private double quantityUsed;
    private BigDecimal unitPrice;
    private BigDecimal totalCost; // unitPrice * quantityUsed
    private Instant createdAt;
    private boolean usedInOrder = false;

    public MaterialUsage() {}

    public MaterialUsage(String rawMaterialId, String userId, String usageDescription, double quantityUsed, BigDecimal unitPrice) {
        this.rawMaterialId = rawMaterialId;
        this.userId = userId;
        this.usageDescription = usageDescription;
        this.quantityUsed = quantityUsed;
        this.unitPrice = unitPrice;
        this.totalCost = unitPrice.multiply(BigDecimal.valueOf(quantityUsed));
        this.createdAt = Instant.now();
        this.usedInOrder = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRawMaterialId() {
        return rawMaterialId;
    }

    public void setRawMaterialId(String rawMaterialId) {
        this.rawMaterialId = rawMaterialId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUsageDescription() {
        return usageDescription;
    }

    public void setUsageDescription(String usageDescription) {
        this.usageDescription = usageDescription;
    }

    public double getQuantityUsed() {
        return quantityUsed;
    }

    public void setQuantityUsed(double quantityUsed) {
        this.quantityUsed = quantityUsed;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isUsedInOrder() {
        return usedInOrder;
    }

    public void setUsedInOrder(boolean usedInOrder) {
        this.usedInOrder = usedInOrder;
    }
}
