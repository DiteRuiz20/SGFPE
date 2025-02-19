package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.Income;
import com.utez.mx.sgfpe.services.business.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/business/incomes") // Base URL for income-related endpoints
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    // Get all incomes
    @GetMapping
    public List<Income> getAllIncomes() {
        return incomeService.getAllIncomes();
    }

    // Get income by ID
    @GetMapping("/{id}")
    public ResponseEntity<Income> getIncomeById(@PathVariable String id) {
        Optional<Income> income = incomeService.getIncomeById(id);
        return income.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new income
    @PostMapping
    public Income createIncome(@RequestBody Income income) {
        return incomeService.saveOrUpdateIncome(income);
    }

    // Update an existing income
    @PutMapping("/{id}")
    public ResponseEntity<Income> updateIncome(@PathVariable String id, @RequestBody Income updatedIncome) {
        Optional<Income> existingIncome = incomeService.getIncomeById(id);
        if (existingIncome.isPresent()) {
            updatedIncome.setId(existingIncome.get().getId());
            return ResponseEntity.ok(incomeService.saveOrUpdateIncome(updatedIncome));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete an income by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable String id) {
        incomeService.deleteIncomeById(id);
        return ResponseEntity.noContent().build();
    }
}
