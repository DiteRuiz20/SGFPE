package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.BusinessExpense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface BusinessExpenseRepository extends MongoRepository<BusinessExpense, String> {
    // Find expenses by company ID
    List<BusinessExpense> findByCompanyId(String companyId);

    // Find expenses by category
    List<BusinessExpense> findByCategory(String category);

    // Find expenses within a date range
    List<BusinessExpense> findByDateBetween(Instant startDate, Instant endDate);
}
