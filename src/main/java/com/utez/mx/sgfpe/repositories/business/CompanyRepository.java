package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.Company;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface CompanyRepository extends MongoRepository<Company, String> {
    // Find companies by the owner user ID
    List<Company> findByOwnerUserId(String ownerUserId);

    // Find companies by type (e.g., raw_materials, product_sales)
    List<Company> findByType(String type);
}
