package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Document(collection = "new_product_expense_order")
public class NewProductExpenseOrder {
    @Id
    private String id;
    private String userId;                         // Relación con el usuario que hizo el pedido
    private Instant orderDate;                     // Fecha en que se hizo el pedido
    private List<NewProductExpenseOrderItem> items; // Productos usados en este pedido
    private BigDecimal totalOrderCost;
    private BigDecimal netProfit; // ✅ Ganancia neta = income - totalOrderCost
    private BigDecimal income;
    private String orderDescription;

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

    public Instant getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Instant orderDate) {
        this.orderDate = orderDate;
    }

    public List<NewProductExpenseOrderItem> getItems() {
        return items;
    }

    public void setItems(List<NewProductExpenseOrderItem> items) {
        this.items = items;
    }

    public BigDecimal getTotalOrderCost() {
        return totalOrderCost;
    }

    public void setTotalOrderCost(BigDecimal totalOrderCost) {
        this.totalOrderCost = totalOrderCost;
    }

    public BigDecimal getNetProfit() {
        return netProfit;
    }

    public void setNetProfit(BigDecimal netProfit) {
        this.netProfit = netProfit;
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
