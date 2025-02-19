package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.ProductPurchase;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface ProductPurchaseRepository extends MongoRepository<ProductPurchase, String> {
    // Find product purchases by category
    List<ProductPurchase> findByCategory(String category);

    // Find product purchases by purchase method (e.g., cash, credit)
    List<ProductPurchase> findByPurchaseMethod(String purchaseMethod);

    // Find product purchases within a date range
    List<ProductPurchase> findByPurchaseDateBetween(Instant startDate, Instant endDate);
}
