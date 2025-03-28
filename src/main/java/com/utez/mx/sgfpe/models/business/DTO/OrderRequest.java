package com.utez.mx.sgfpe.models.business.DTO;

import java.math.BigDecimal;
import java.util.List;

public class OrderRequest {
    private String userId;
    private List<String> materialUsageIds;
    private BigDecimal income;
    private String orderDescription;

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public List<String> getMaterialUsageIds() {
        return materialUsageIds;
    }

    public void setMaterialUsageIds(List<String> materialUsageIds) {
        this.materialUsageIds = materialUsageIds;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public String getOrderDescription() {
        return orderDescription;
    }

    public void setOrderDescription(String orderDescription) {
        this.orderDescription = orderDescription;
    }
}