package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.ProductPurchase;
import com.utez.mx.sgfpe.repositories.business.ProductPurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class ProductPurchaseService {

    @Autowired
    private ProductPurchaseRepository productPurchaseRepository;

    // Get all product purchases
    public List<ProductPurchase> getAllProductPurchases() {
        return productPurchaseRepository.findAll();
    }

    // Get product purchase by ID
    public Optional<ProductPurchase> getProductPurchaseById(String id) {
        return productPurchaseRepository.findById(id);
    }

    // Get product purchases by category
    public List<ProductPurchase> getProductPurchasesByCategory(String category) {
        return productPurchaseRepository.findByCategory(category);
    }

    // Get product purchases by date range
    public List<ProductPurchase> getProductPurchasesByDateRange(Instant startDate, Instant endDate) {
        return productPurchaseRepository.findByPurchaseDateBetween(startDate, endDate);
    }

    // Save or update a product purchase
    public ProductPurchase saveOrUpdateProductPurchase(ProductPurchase productPurchase) {
        return productPurchaseRepository.save(productPurchase);
    }

    // Delete product purchase by ID
    public void deleteProductPurchaseById(String id) {
        productPurchaseRepository.deleteById(id);
    }
}
