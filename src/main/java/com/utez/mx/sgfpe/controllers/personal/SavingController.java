package com.utez.mx.sgfpe.controllers.personal;

import com.utez.mx.sgfpe.models.personal.Saving;
import com.utez.mx.sgfpe.services.personal.SavingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal/savings") // Base URL for savings-related endpoints
public class SavingController {

    @Autowired
    private SavingService savingService;

    // Get all savings
    @GetMapping
    public List<Saving> getAllSavings() {
        return savingService.getAllSavings();
    }

    // Get saving by ID
    @GetMapping("/{id}")
    public ResponseEntity<Saving> getSavingById(@PathVariable String id) {
        Optional<Saving> saving = savingService.getSavingById(id);
        return saving.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new saving
    @PostMapping
    public Saving createSaving(@RequestBody Saving saving) {
        return savingService.saveOrUpdateSaving(saving);
    }

    // Update an existing saving
    @PutMapping("/{id}")
    public ResponseEntity<Saving> updateSaving(@PathVariable String id, @RequestBody Saving updatedSaving) {
        Optional<Saving> existingSaving = savingService.getSavingById(id);
        if (existingSaving.isPresent()) {
            updatedSaving.setId(existingSaving.get().getId());
            return ResponseEntity.ok(savingService.saveOrUpdateSaving(updatedSaving));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get expenses by userId (with category name)
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Saving>> getSavingsByUserId(@PathVariable String userId) {
        List<Saving> savings = savingService.getSavingsByUser(userId);
        if (savings.isEmpty()) {
            return ResponseEntity.noContent().build(); // Devuelve 204 si no hay ahorros
        }
        return ResponseEntity.ok(savings); // Devuelve 200 con la lista de ahorros
    }

    // Delete a saving by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSaving(@PathVariable String id) {
        savingService.deleteSavingById(id);
        return ResponseEntity.noContent().build();
    }
}
