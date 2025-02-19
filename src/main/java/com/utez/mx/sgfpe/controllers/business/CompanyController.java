package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.Company;
import com.utez.mx.sgfpe.services.business.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/business/companies") // Base URL for company-related endpoints
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    // Get all companies
    @GetMapping
    public List<Company> getAllCompanies() {
        return companyService.getAllCompanies();
    }

    // Get company by ID
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable String id) {
        Optional<Company> company = companyService.getCompanyById(id);
        return company.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new company
    @PostMapping
    public Company createCompany(@RequestBody Company company) {
        return companyService.saveOrUpdateCompany(company);
    }

    // Update an existing company
    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable String id, @RequestBody Company updatedCompany) {
        Optional<Company> existingCompany = companyService.getCompanyById(id);
        if (existingCompany.isPresent()) {
            updatedCompany.setId(existingCompany.get().getId());
            return ResponseEntity.ok(companyService.saveOrUpdateCompany(updatedCompany));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a company by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable String id) {
        companyService.deleteCompanyById(id);
        return ResponseEntity.noContent().build();
    }
}
