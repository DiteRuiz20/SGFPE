package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.RawMaterial;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.time.Instant;
import java.util.List;

public interface RawMaterialRepository extends MongoRepository<RawMaterial, String> {

    // Buscar todos los insumos de un usuario específico
    List<RawMaterial> findByUserId(String userId);

    // Buscar insumos por proveedor
    List<RawMaterial> findBySupplier(String supplier);

    // Buscar insumos entre fechas
    List<RawMaterial> findByEntryDateBetween(Instant startDate, Instant endDate);
}
