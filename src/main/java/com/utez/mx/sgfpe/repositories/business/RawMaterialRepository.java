package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.RawMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface RawMaterialRepository extends MongoRepository<RawMaterial, String> {
    // Find raw materials by supplier
    List<RawMaterial> findBySupplier(String supplier);

    // Find raw materials by measurement unit (e.g., kg, liters)
    List<RawMaterial> findByMeasurementUnit(String measurementUnit);

    // Find raw materials within a date range
    List<RawMaterial> findByEntryDateBetween(Instant startDate, Instant endDate);
}
