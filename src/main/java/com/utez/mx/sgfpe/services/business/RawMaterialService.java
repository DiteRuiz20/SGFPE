package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.RawMaterial;
import com.utez.mx.sgfpe.repositories.business.RawMaterialRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class RawMaterialService {

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    // Get all raw materials
    public List<RawMaterial> getAllRawMaterials() {
        return rawMaterialRepository.findAll();
    }

    // Get raw material by ID
    public Optional<RawMaterial> getRawMaterialById(String id) {
        return rawMaterialRepository.findById(id);
    }

    // Get raw materials by supplier
    public List<RawMaterial> getRawMaterialsBySupplier(String supplier) {
        return rawMaterialRepository.findBySupplier(supplier);
    }

    // Get raw materials by date range
    public List<RawMaterial> getRawMaterialsByDateRange(Instant startDate, Instant endDate) {
        return rawMaterialRepository.findByEntryDateBetween(startDate, endDate);
    }

    // Save or update a raw material
    public RawMaterial saveOrUpdateRawMaterial(RawMaterial rawMaterial) {
        return rawMaterialRepository.save(rawMaterial);
    }

    // Delete raw material by ID
    public void deleteRawMaterialById(String id) {
        rawMaterialRepository.deleteById(id);
    }
}
