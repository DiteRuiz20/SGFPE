package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "orders") // MongoDB collection for customer orders
public class Order {

    @Id
    private ObjectId id; // Unique identifier for each order

    private String companyId; // ID of the company handling this order
    private Instant orderDate; // Date the order was placed
    private BigDecimal totalAmount; // Total amount for the order
    private String customerName; // Name of the customer placing the order
    private String status; // Status of the order: "pending", "completed", "cancelled"

    // Default constructor required by MongoDB
    public Order(){
    }

    // Constructor with all attributes for easy instantiation
    public Order(String companyId, Instant orderDate, BigDecimal totalAmount, String customerName, String status) {
        this.companyId = companyId;
        this.orderDate = orderDate;
        this.totalAmount = totalAmount;
        this.customerName = customerName;
        this.status = status;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getCompanyId() {
        return companyId;
    }

    public void setCompanyId(String companyId) {
        this.companyId = companyId;
    }

    public Instant getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(Instant orderDate) {
        this.orderDate = orderDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
