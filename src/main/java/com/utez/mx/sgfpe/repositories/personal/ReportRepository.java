package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.Report;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface ReportRepository extends MongoRepository<Report, String> {
    // Find reports by user ID
    List<Report> findByUserId(String userId);

    // Find reports by type (e.g., "monthly", "yearly", "custom")
    List<Report> findByReportType(String reportType);

    // Find reports within a date range
    List<Report> findByReportDateBetween(Instant startDate, Instant endDate);
}
