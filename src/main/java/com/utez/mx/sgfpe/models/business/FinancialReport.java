package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Document(collection = "financial_reports") // MongoDB collection for financial reports
public class FinancialReport {

    @Id
    private ObjectId id; // Unique identifier for the report

    private String companyId; // ID of the company for this report
    private Instant reportDate; // Date of the financial report
    private BigDecimal totalIncome; // Total income during the report period
    private BigDecimal totalExpense; // Total expenses during the report period
    private BigDecimal netProfit; // Calculated as (totalIncome - totalExpense)

    // Default constructor required by MongoDB
    public FinancialReport() {
    }

    // Constructor with all attributes for easy report creation
    public FinancialReport(String companyId, Instant reportDate, BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal netProfit) {
        this.companyId = companyId;
        this.reportDate = reportDate;
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.netProfit = netProfit;
    }
}
