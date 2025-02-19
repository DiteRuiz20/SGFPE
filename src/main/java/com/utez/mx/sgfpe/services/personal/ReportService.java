package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.Report;
import com.utez.mx.sgfpe.repositories.personal.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    // Get all reports
    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    // Get report by ID
    public Optional<Report> getReportById(String id) {
        return reportRepository.findById(id);
    }

    // Get reports by user ID
    public List<Report> getReportsByUser(String userId) {
        return reportRepository.findByUserId(userId);
    }

    // Get reports by type (e.g., "monthly", "yearly", "custom")
    public List<Report> getReportsByType(String reportType) {
        return reportRepository.findByReportType(reportType);
    }

    // Get reports by date range
    public List<Report> getReportsByDateRange(Instant startDate, Instant endDate) {
        return reportRepository.findByReportDateBetween(startDate, endDate);
    }

    // Save or update a report
    public Report saveOrUpdateReport(Report report) {
        return reportRepository.save(report);
    }

    // Delete report by ID
    public void deleteReportById(String id) {
        reportRepository.deleteById(id);
    }
}
