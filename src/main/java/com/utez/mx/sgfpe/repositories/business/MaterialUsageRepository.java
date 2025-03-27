package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface MaterialUsageRepository extends MongoRepository<MaterialUsage, String> {
    List<MaterialUsage> findByUserId(String userId);
    List<MaterialUsage> findByRawMaterialId(String rawMaterialId);
}
