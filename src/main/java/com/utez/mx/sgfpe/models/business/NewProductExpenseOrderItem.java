package com.utez.mx.sgfpe.models.business;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class NewProductExpenseOrderItem {
    private String productId;
    private String productDescription;
    private double quantity;
    private BigDecimal unitCost;
    private BigDecimal totalCost;

    public NewProductExpenseOrderItem() {}

    public NewProductExpenseOrderItem(String productId, String productDescription,
                                      double quantity, BigDecimal unitCost) {
        this.productId = productId;
        this.productDescription = productDescription;
        this.quantity = quantity;
        this.unitCost = unitCost;
        this.totalCost = unitCost.multiply(BigDecimal.valueOf(quantity));
    }

    public String getProductId() {
        return productId;
    }

    public void setProductId(String productId) {
        this.productId = productId;
    }

    public String getProductDescription() {
        return productDescription;
    }

    public void setProductDescription(String productDescription) {
        this.productDescription = productDescription;
    }

    public double getQuantity() {
        return quantity;
    }

    public void setQuantity(double quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitCost() {
        return unitCost;
    }

    public void setUnitCost(BigDecimal unitCost) {
        this.unitCost = unitCost;
    }

    public BigDecimal getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(BigDecimal totalCost) {
        this.totalCost = totalCost;
    }
}
