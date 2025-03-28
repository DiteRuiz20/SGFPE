package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import com.utez.mx.sgfpe.repositories.business.MaterialUsageRepository;
import com.utez.mx.sgfpe.services.business.MaterialUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/material-usage")
public class MaterialUsageController {

    @Autowired
    private MaterialUsageService materialUsageService;

    @Autowired
    private MaterialUsageRepository materialUsageRepository;

    @GetMapping("/available/{userId}")
    public ResponseEntity<List<MaterialUsage>> getAvailableUsages(@PathVariable String userId) {
        return ResponseEntity.ok(materialUsageRepository.findByUserIdAndUsedInOrderFalse(userId));
    }

    @PostMapping("/create")
    public ResponseEntity<?> consumeMaterial(@RequestBody Map<String, Object> payload) {
        try {
            String rawMaterialId = (String) payload.get("materialId");
            String userId = (String) payload.get("userId");
            String description = (String) payload.get("description");
            double quantity = Double.parseDouble(payload.get("quantity").toString());

            MaterialUsage usage = materialUsageService.createUsage(rawMaterialId, userId, description, quantity);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Consumo registrado exitosamente");
            response.put("usage", usage);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    // Nuevo método para obtener todos los registros
    @GetMapping()
    public ResponseEntity<List<MaterialUsage>> getAllUsages() {
        List<MaterialUsage> usages = materialUsageService.getAllUsages();
        return ResponseEntity.ok(usages);
    }

    // Nuevo método para obtener registros por userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MaterialUsage>> getUsagesByUserId(@PathVariable String userId) {
        List<MaterialUsage> usages = materialUsageService.getUsagesByUserId(userId);
        return ResponseEntity.ok(usages);
    }

    // Nuevo método para eliminar un registro
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUsage(@PathVariable String id) {
        try {
            materialUsageService.deleteUsage(id);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Consumo eliminado exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}