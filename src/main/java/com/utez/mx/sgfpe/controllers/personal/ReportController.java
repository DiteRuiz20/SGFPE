package com.utez.mx.sgfpe.controllers.personal;

import com.utez.mx.sgfpe.models.personal.Report;
import com.utez.mx.sgfpe.services.personal.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/personal/reports") // Base URL for report-related endpoints
public class ReportController {

    @Autowired
    private ReportService reportService;

    // Get all reports
    @GetMapping
    public List<Report> getAllReports() {
        return reportService.getAllReports();
    }

    // Get report by ID
    @GetMapping("/{id}")
    public ResponseEntity<Report> getReportById(@PathVariable String id) {
        Optional<Report> report = reportService.getReportById(id);
        return report.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new report
    @PostMapping
    public Report createReport(@RequestBody Report report) {
        return reportService.saveOrUpdateReport(report);
    }

    // Update an existing report
    @PutMapping("/{id}")
    public ResponseEntity<Report> updateReport(@PathVariable String id, @RequestBody Report updatedReport) {
        Optional<Report> existingReport = reportService.getReportById(id);
        if (existingReport.isPresent()) {
            updatedReport.setId(existingReport.get().getId());
            return ResponseEntity.ok(reportService.saveOrUpdateReport(updatedReport));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a report by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReport(@PathVariable String id) {
        reportService.deleteReportById(id);
        return ResponseEntity.noContent().build();
    }
}
