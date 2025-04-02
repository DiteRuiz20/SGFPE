package com.utez.mx.sgfpe.models.business.DTO;

import java.math.BigDecimal;
import java.util.List;

public class NewProductOrderRequest {

    private String userId;
    private String orderDescription;
    private BigDecimal income;
    private List<ItemRequest> items;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getOrderDescription() {
        return orderDescription;
    }

    public void setOrderDescription(String orderDescription) {
        this.orderDescription = orderDescription;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public List<ItemRequest> getItems() {
        return items;
    }

    public void setItems(List<ItemRequest> items) {
        this.items = items;
    }

    public static class ItemRequest {
        private String productId;
        private double quantity;

        public String getProductId() {
            return productId;
        }

        public void setProductId(String productId) {
            this.productId = productId;
        }

        public double getQuantity() {
            return quantity;
        }

        public void setQuantity(double quantity) {
            this.quantity = quantity;
        }
    }
}
