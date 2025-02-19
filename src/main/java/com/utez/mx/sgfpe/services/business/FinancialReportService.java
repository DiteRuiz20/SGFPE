package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.FinancialReport;
import com.utez.mx.sgfpe.repositories.business.FinancialReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class FinancialReportService {

    @Autowired
    private FinancialReportRepository financialReportRepository;

    // Get all financial reports
    public List<FinancialReport> getAllFinancialReports() {
        return financialReportRepository.findAll();
    }

    // Get financial report by ID
    public Optional<FinancialReport> getFinancialReportById(String id) {
        return financialReportRepository.findById(id);
    }

    // Get financial reports by company ID
    public List<FinancialReport> getFinancialReportsByCompany(String companyId) {
        return financialReportRepository.findByCompanyId(companyId);
    }

    // Get financial reports by date range
    public List<FinancialReport> getFinancialReportsByDateRange(Instant startDate, Instant endDate) {
        return financialReportRepository.findByReportDateBetween(startDate, endDate);
    }

    // Save or update a financial report
    public FinancialReport saveOrUpdateFinancialReport(FinancialReport report) {
        return financialReportRepository.save(report);
    }

    // Delete financial report by ID
    public void deleteFinancialReportById(String id) {
        financialReportRepository.deleteById(id);
    }
}
