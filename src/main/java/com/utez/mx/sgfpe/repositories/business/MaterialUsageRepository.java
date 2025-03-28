package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialUsageRepository extends MongoRepository<MaterialUsage, String> {
    List<MaterialUsage> findByUserId(String userId);

    List<MaterialUsage> findByUserIdAndUsedInOrderFalse(String userId);
}