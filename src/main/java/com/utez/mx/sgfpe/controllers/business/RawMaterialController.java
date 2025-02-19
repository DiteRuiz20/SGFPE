package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.RawMaterial;
import com.utez.mx.sgfpe.services.business.RawMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/business/raw-materials") // Base URL for raw material-related endpoints
public class RawMaterialController {

    @Autowired
    private RawMaterialService rawMaterialService;

    // Get all raw materials
    @GetMapping
    public List<RawMaterial> getAllRawMaterials() {
        return rawMaterialService.getAllRawMaterials();
    }

    // Get raw material by ID
    @GetMapping("/{id}")
    public ResponseEntity<RawMaterial> getRawMaterialById(@PathVariable String id) {
        Optional<RawMaterial> rawMaterial = rawMaterialService.getRawMaterialById(id);
        return rawMaterial.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new raw material
    @PostMapping
    public RawMaterial createRawMaterial(@RequestBody RawMaterial rawMaterial) {
        return rawMaterialService.saveOrUpdateRawMaterial(rawMaterial);
    }

    // Update an existing raw material
    @PutMapping("/{id}")
    public ResponseEntity<RawMaterial> updateRawMaterial(@PathVariable String id, @RequestBody RawMaterial updatedRawMaterial) {
        Optional<RawMaterial> existingRawMaterial = rawMaterialService.getRawMaterialById(id);
        if (existingRawMaterial.isPresent()) {
            updatedRawMaterial.setId(existingRawMaterial.get().getId());
            return ResponseEntity.ok(rawMaterialService.saveOrUpdateRawMaterial(updatedRawMaterial));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a raw material by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRawMaterial(@PathVariable String id) {
        rawMaterialService.deleteRawMaterialById(id);
        return ResponseEntity.noContent().build();
    }
}
