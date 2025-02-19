package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.ProductPurchase;
import com.utez.mx.sgfpe.services.business.ProductPurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/business/product-purchases") // Base URL for product purchase-related endpoints
public class ProductPurchaseController {

    @Autowired
    private ProductPurchaseService productPurchaseService;

    // Get all product purchases
    @GetMapping
    public List<ProductPurchase> getAllProductPurchases() {
        return productPurchaseService.getAllProductPurchases();
    }

    // Get product purchase by ID
    @GetMapping("/{id}")
    public ResponseEntity<ProductPurchase> getProductPurchaseById(@PathVariable String id) {
        Optional<ProductPurchase> productPurchase = productPurchaseService.getProductPurchaseById(id);
        return productPurchase.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Create a new product purchase
    @PostMapping
    public ProductPurchase createProductPurchase(@RequestBody ProductPurchase productPurchase) {
        return productPurchaseService.saveOrUpdateProductPurchase(productPurchase);
    }

    // Update an existing product purchase
    @PutMapping("/{id}")
    public ResponseEntity<ProductPurchase> updateProductPurchase(@PathVariable String id, @RequestBody ProductPurchase updatedProductPurchase) {
        Optional<ProductPurchase> existingProductPurchase = productPurchaseService.getProductPurchaseById(id);
        if (existingProductPurchase.isPresent()) {
            updatedProductPurchase.setId(existingProductPurchase.get().getId());
            return ResponseEntity.ok(productPurchaseService.saveOrUpdateProductPurchase(updatedProductPurchase));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Delete a product purchase by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProductPurchase(@PathVariable String id) {
        productPurchaseService.deleteProductPurchaseById(id);
        return ResponseEntity.noContent().build();
    }
}
