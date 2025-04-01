package com.utez.mx.sgfpe.models.business;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    private String userId;
    private String orderDescription;
    private List<String> newProductExpenseIds; // Para pedidos desde nueva mercancía
    private List<String> materialUsageIds;
    private BigDecimal income;
    private BigDecimal netProfit;
    private Instant createdAt;

    public Order() {}

    public Order(String userId, String orderDescription, List<String> materialUsageIds, BigDecimal income, BigDecimal netProfit) {
        this.userId = userId;
        this.orderDescription = orderDescription;
        this.materialUsageIds = materialUsageIds;
        this.income = income;
        this.netProfit = netProfit;
        this.createdAt = Instant.now();
    }

    public Order(String userId, String orderDescription, List<String> materialUsageIds, List<String> newProductExpenseIds,
                 BigDecimal income, BigDecimal netProfit, Instant createdAt) {
        this.userId = userId;
        this.orderDescription = orderDescription;
        this.materialUsageIds = materialUsageIds;
        this.newProductExpenseIds = newProductExpenseIds;
        this.income = income;
        this.netProfit = netProfit;
        this.createdAt = createdAt;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getNewProductExpenseIds() {
        return newProductExpenseIds;
    }

    public void setNewProductExpenseIds(List<String> newProductExpenseIds) {
        this.newProductExpenseIds = newProductExpenseIds;
    }
}
