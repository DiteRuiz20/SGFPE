package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.FinancialReport;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface FinancialReportRepository extends MongoRepository<FinancialReport, String> {
    // Find financial reports by company ID
    List<FinancialReport> findByCompanyId(String companyId);

    // Find financial reports by date range
    List<FinancialReport> findByReportDateBetween(Instant startDate, Instant endDate);
}
