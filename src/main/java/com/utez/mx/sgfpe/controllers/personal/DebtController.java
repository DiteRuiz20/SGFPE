package com.utez.mx.sgfpe.controllers.personal;

import com.utez.mx.sgfpe.models.personal.Debt;
import com.utez.mx.sgfpe.services.personal.DebtService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal/debts") // Base URL for debt-related endpoints
public class DebtController {

    @Autowired
    private DebtService debtService;

    // Get all debts
    @GetMapping
    public List<Debt> getAllDebts() {
        return debtService.getAllDebts();
    }

    // Get debt by ID
    @GetMapping("/{id}")
    public ResponseEntity<Debt> getDebtById(@PathVariable String id) {
        Optional<Debt> debt = debtService.getDebtById(id);
        return debt.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new debt
    @PostMapping
    public Debt createDebt(@RequestBody Debt debt) {
        return debtService.saveOrUpdateDebt(debt);
    }

    // Update an existing debt
    @PutMapping("/{id}")
    public ResponseEntity<Debt> updateDebt(@PathVariable String id, @RequestBody Debt updatedDebt) {
        Optional<Debt> existingDebt = debtService.getDebtById(id);
        if (existingDebt.isPresent()) {
            updatedDebt.setId(existingDebt.get().getId());
            return ResponseEntity.ok(debtService.saveOrUpdateDebt(updatedDebt));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    //Get debts by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Debt>> getDebtsByUserId(@PathVariable String userId) {
        List<Debt> debts = debtService.getDebtsByUser(userId);
        return ResponseEntity.ok(debts);
    }

    // Delete a debt by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDebt(@PathVariable String id) {
        debtService.deleteDebtById(id);
        return ResponseEntity.noContent().build();
    }
}
