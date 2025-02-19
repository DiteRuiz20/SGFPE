package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.Income;
import com.utez.mx.sgfpe.repositories.business.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    // Get all incomes
    public List<Income> getAllIncomes() {
        return incomeRepository.findAll();
    }

    // Get income by ID
    public Optional<Income> getIncomeById(String id) {
        return incomeRepository.findById(id);
    }

    // Get incomes by company ID
    public List<Income> getIncomesByCompany(String companyId) {
        return incomeRepository.findByCompanyId(companyId);
    }

    // Get incomes by date range
    public List<Income> getIncomesByDateRange(Instant startDate, Instant endDate) {
        return incomeRepository.findByDateBetween(startDate, endDate);
    }

    // Save or update an income
    public Income saveOrUpdateIncome(Income income) {
        return incomeRepository.save(income);
    }

    // Delete income by ID
    public void deleteIncomeById(String id) {
        incomeRepository.deleteById(id);
    }
}
