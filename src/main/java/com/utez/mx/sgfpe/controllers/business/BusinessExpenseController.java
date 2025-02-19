package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.BusinessExpense;
import com.utez.mx.sgfpe.services.business.BusinessExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/business/expenses") // Base URL for expense-related endpoints
public class BusinessExpenseController {

    @Autowired
    private BusinessExpenseService businessExpenseService;

    // Get all expenses
    @GetMapping
    public List<BusinessExpense> getAllExpenses() {
        return businessExpenseService.getAllExpenses();
    }

    // Get expense by ID
    @GetMapping("/{id}")
    public ResponseEntity<BusinessExpense> getExpenseById(@PathVariable String id) {
        Optional<BusinessExpense> expense = businessExpenseService.getExpenseById(id);
        return expense.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new businessExpense
    @PostMapping
    public BusinessExpense createExpense(@RequestBody BusinessExpense businessExpense) {
        return businessExpenseService.saveOrUpdateExpense(businessExpense);
    }

    // Update an existing expense
    @PutMapping("/{id}")
    public ResponseEntity<BusinessExpense> updateExpense(@PathVariable String id, @RequestBody BusinessExpense updatedBusinessExpense) {
        Optional<BusinessExpense> existingExpense = businessExpenseService.getExpenseById(id);
        if (existingExpense.isPresent()) {
            updatedBusinessExpense.setId(existingExpense.get().getId());
            return ResponseEntity.ok(businessExpenseService.saveOrUpdateExpense(updatedBusinessExpense));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete an expense by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        businessExpenseService.deleteExpenseById(id);
        return ResponseEntity.noContent().build();
    }
}
