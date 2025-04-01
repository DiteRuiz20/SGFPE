package com.utez.mx.sgfpe.models.business.DTO;

import java.math.BigDecimal;
import java.util.List;

public class NewProductOrderRequest {
    private String userId;
    private String orderDescription;
    private List<String> newProductExpenseIds;
    private BigDecimal income;

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

    public List<String> getNewProductExpenseIds() {
        return newProductExpenseIds;
    }

    public void setNewProductExpenseIds(List<String> newProductExpenseIds) {
        this.newProductExpenseIds = newProductExpenseIds;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }
}
