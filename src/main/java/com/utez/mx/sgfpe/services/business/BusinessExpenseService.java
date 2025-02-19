package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.BusinessExpense;
import com.utez.mx.sgfpe.repositories.business.BusinessExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class BusinessExpenseService {

    @Autowired
    private BusinessExpenseRepository businessExpenseRepository;

    // Get all expenses
    public List<BusinessExpense> getAllExpenses() {
        return businessExpenseRepository.findAll();
    }

    // Get expense by ID
    public Optional<BusinessExpense> getExpenseById(String id) {
        return businessExpenseRepository.findById(id);
    }

    // Get expenses by company ID
    public List<BusinessExpense> getExpensesByCompany(String companyId) {
        return businessExpenseRepository.findByCompanyId(companyId);
    }

    // Get expenses by date range
    public List<BusinessExpense> getExpensesByDateRange(Instant startDate, Instant endDate) {
        return businessExpenseRepository.findByDateBetween(startDate, endDate);
    }

    // Save or update an businessExpense
    public BusinessExpense saveOrUpdateExpense(BusinessExpense businessExpense) {
        return businessExpenseRepository.save(businessExpense);
    }

    // Delete expense by ID
    public void deleteExpenseById(String id) {
        businessExpenseRepository.deleteById(id);
    }
}
