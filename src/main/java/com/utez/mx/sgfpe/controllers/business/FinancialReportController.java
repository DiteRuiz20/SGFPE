package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.FinancialReport;
import com.utez.mx.sgfpe.services.business.FinancialReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/business/financial-reports") // Base URL for financial report endpoints
public class FinancialReportController {

    @Autowired
    private FinancialReportService financialReportService;

    // Get all financial reports
    @GetMapping
    public List<FinancialReport> getAllFinancialReports() {
        return financialReportService.getAllFinancialReports();
    }

    // Get financial report by ID
    @GetMapping("/{id}")
    public ResponseEntity<FinancialReport> getFinancialReportById(@PathVariable String id) {
        Optional<FinancialReport> report = financialReportService.getFinancialReportById(id);
        return report.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new financial report
    @PostMapping
    public FinancialReport createFinancialReport(@RequestBody FinancialReport report) {
        return financialReportService.saveOrUpdateFinancialReport(report);
    }

    // Update an existing financial report
    @PutMapping("/{id}")
    public ResponseEntity<FinancialReport> updateFinancialReport(@PathVariable String id, @RequestBody FinancialReport updatedReport) {
        Optional<FinancialReport> existingReport = financialReportService.getFinancialReportById(id);
        if (existingReport.isPresent()) {
            updatedReport.setId(existingReport.get().getId());
            return ResponseEntity.ok(financialReportService.saveOrUpdateFinancialReport(updatedReport));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a financial report by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFinancialReport(@PathVariable String id) {
        financialReportService.deleteFinancialReportById(id);
        return ResponseEntity.noContent().build();
    }
}
