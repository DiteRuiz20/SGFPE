package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.Category;
import com.utez.mx.sgfpe.repositories.personal.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    // Get all categories
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // Get category by ID
    public Optional<Category> getCategoryById(String id) {
        return categoryRepository.findById(id);
    }

    // Get category by name
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }

    // Save or update a category
    public Category saveOrUpdateCategory(Category category) {
        return categoryRepository.save(category);
    }

    // Delete category by ID
    public void deleteCategoryById(String id) {
        categoryRepository.deleteById(id);
    }
}
