package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import com.utez.mx.sgfpe.models.business.RawMaterial;
import com.utez.mx.sgfpe.repositories.business.MaterialUsageRepository;
import com.utez.mx.sgfpe.repositories.business.RawMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class MaterialUsageService {

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    @Autowired
    private MaterialUsageRepository materialUsageRepository;

    public MaterialUsage createUsage(String rawMaterialId, String userId, String description, double quantityUsed) throws Exception {
        Optional<RawMaterial> optional = rawMaterialRepository.findById(rawMaterialId);
        if (optional.isEmpty()) {
            throw new Exception("Materia prima no encontrada");
        }

        RawMaterial material = optional.get();

        if (quantityUsed > material.getQuantity()) {
            throw new Exception("La cantidad usada excede la disponible en inventario");
        }

        // Calcular total
        BigDecimal unitPrice = material.getUnitPrice();
        BigDecimal totalCost = unitPrice.multiply(BigDecimal.valueOf(quantityUsed));

        // Crear registro de insumo usado
        MaterialUsage usage = new MaterialUsage(
                rawMaterialId,
                userId,
                description,
                quantityUsed,
                unitPrice
        );
        usage.setTotalCost(totalCost);
        usage.setCreatedAt(Instant.now());

        // Restar la cantidad de materia prima
        double newQuantity = material.getQuantity() - quantityUsed;
        if (newQuantity == 0) {
            rawMaterialRepository.deleteById(rawMaterialId);
        } else {
            material.setQuantity(newQuantity);
            rawMaterialRepository.save(material);
        }

        return materialUsageRepository.save(usage);
    }

    // Método para obtener todos los registros
    public List<MaterialUsage> getAllUsages() {
        return materialUsageRepository.findAll();
    }

    // Método para obtener registros por userId
    public List<MaterialUsage> getUsagesByUserId(String userId) {
        return materialUsageRepository.findByUserId(userId);
    }

    // Método para eliminar un registro
    public void deleteUsage(String id) {
        materialUsageRepository.deleteById(id);
    }
}
