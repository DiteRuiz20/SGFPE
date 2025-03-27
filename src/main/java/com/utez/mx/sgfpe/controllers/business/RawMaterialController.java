// Controlador: RawMaterialController.java
package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.RawMaterial;
import com.utez.mx.sgfpe.services.business.RawMaterialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
        import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/raw-materials")
public class RawMaterialController {

    @Autowired
    private RawMaterialService rawMaterialService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RawMaterial>> getRawMaterialsByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(rawMaterialService.getRawMaterialsByUserId(userId));
    }

    @PostMapping("/upload")
    public ResponseEntity<List<RawMaterial>> importFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) throws IOException {
        return ResponseEntity.ok(rawMaterialService.importRawMaterialsFromExcel(file, userId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RawMaterial> getById(@PathVariable String id) {
        Optional<RawMaterial> result = rawMaterialService.getRawMaterialById(id);
        return result.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RawMaterial> saveOrUpdate(@RequestBody RawMaterial rawMaterial) {
        return ResponseEntity.ok(rawMaterialService.saveOrUpdateRawMaterial(rawMaterial));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        rawMaterialService.deleteRawMaterialById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/range")
    public ResponseEntity<List<RawMaterial>> getByDateRange(
            @RequestParam Instant start,
            @RequestParam Instant end) {
        return ResponseEntity.ok(rawMaterialService.getRawMaterialsByDateRange(start, end));
    }

    @GetMapping("/supplier/{supplier}")
    public ResponseEntity<List<RawMaterial>> getBySupplier(@PathVariable String supplier) {
        return ResponseEntity.ok(rawMaterialService.getRawMaterialsBySupplier(supplier));
    }

    @PostMapping("/consume")
    public ResponseEntity<String> consumeMaterial(@RequestBody Map<String, Object> payload) {
        try {
            String materialId = (String) payload.get("materialId");
            double amountToConsume = Double.parseDouble(payload.get("quantity").toString());
            rawMaterialService.consumeMaterial(materialId, amountToConsume);
            return ResponseEntity.ok("Insumo consumido exitosamente");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

}
