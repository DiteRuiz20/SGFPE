package com.utez.mx.sgfpe.controllers.personal;

import com.utez.mx.sgfpe.models.personal.PersonalExpense;
import com.utez.mx.sgfpe.services.personal.PersonalExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal/expenses") // Base URL for personal expense-related endpoints
public class PersonalExpenseController {

    @Autowired
    private PersonalExpenseService personalExpenseService;

    // Get all expenses
    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllExpenses() {
        List<Map<String, Object>> expenses = personalExpenseService.getAllExpenses();
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build(); // Devuelve 204 si no hay gastos
        }
        return ResponseEntity.ok(expenses); // Devuelve 200 con la lista de gastos
    }

    // Get expense by ID
    @GetMapping("/{id}")
    public ResponseEntity<PersonalExpense> getExpenseById(@PathVariable String id) {
        Optional<PersonalExpense> expense = personalExpenseService.getExpenseById(id);
        return expense.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new personalExpense
    @PostMapping
    public PersonalExpense createExpense(@RequestBody PersonalExpense personalExpense) {
        return personalExpenseService.saveOrUpdateExpense(personalExpense);
    }

    // Update an existing expense
    @PutMapping("/{id}")
    public ResponseEntity<PersonalExpense> updateExpense(@PathVariable String id, @RequestBody PersonalExpense updatedPersonalExpense) {
        Optional<PersonalExpense> existingExpense = personalExpenseService.getExpenseById(id);
        if (existingExpense.isPresent()) {
            updatedPersonalExpense.setId(existingExpense.get().getId());
            return ResponseEntity.ok(personalExpenseService.saveOrUpdateExpense(updatedPersonalExpense));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete an expense by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable String id) {
        personalExpenseService.deleteExpenseById(id);
        return ResponseEntity.noContent().build();
    }

    // Get expenses by userId (with category name)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Map<String, Object>>> getExpensesByUserId(@PathVariable String userId) {
        List<Map<String, Object>> expenses = personalExpenseService.getExpensesByUser(userId);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build(); // Devuelve 204 si no hay gastos
        }
        return ResponseEntity.ok(expenses); // Devuelve 200 con la lista de gastos
    }

    // Get expenses by categoryId (with category name)
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<PersonalExpense>> getExpensesByCategory(@PathVariable String categoryId) {
        List<PersonalExpense> expenses = personalExpenseService.getExpensesByCategory(categoryId);
        if (expenses.isEmpty()) {
            return ResponseEntity.noContent().build(); // Return 204 No Content if no expenses are found
        }
        return ResponseEntity.ok(expenses); // Return 200 OK with the list of expenses
    }
}
