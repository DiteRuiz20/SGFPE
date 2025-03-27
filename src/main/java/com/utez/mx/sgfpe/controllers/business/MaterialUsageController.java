package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import com.utez.mx.sgfpe.services.business.MaterialUsageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/material-usage")
public class MaterialUsageController {

    @Autowired
    private MaterialUsageService materialUsageService;

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
}