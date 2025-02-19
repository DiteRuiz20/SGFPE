package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.Company;
import com.utez.mx.sgfpe.repositories.business.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    // Get all companies
    public List<Company> getAllCompanies() {
        return companyRepository.findAll();
    }

    // Get company by ID
    public Optional<Company> getCompanyById(String id) {
        return companyRepository.findById(id);
    }

    // Get companies by owner user ID
    public List<Company> getCompaniesByOwner(String ownerUserId) {
        return companyRepository.findByOwnerUserId(ownerUserId);
    }

    // Save or update a company
    public Company saveOrUpdateCompany(Company company) {
        return companyRepository.save(company);
    }

    // Delete company by ID
    public void deleteCompanyById(String id) {
        companyRepository.deleteById(id);
    }
}
