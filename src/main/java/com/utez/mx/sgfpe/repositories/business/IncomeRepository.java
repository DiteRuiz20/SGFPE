package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.Income;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface IncomeRepository extends MongoRepository<Income, String> {
    // Find incomes by company ID
    List<Income> findByCompanyId(String companyId);

    // Find incomes by source (e.g., sales, services)
    List<Income> findBySource(String source);

    // Find incomes within a date range
    List<Income> findByDateBetween(Instant startDate, Instant endDate);
}
