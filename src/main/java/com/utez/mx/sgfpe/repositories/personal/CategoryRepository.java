package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.Category;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // Marks this as a repository in Spring
public interface CategoryRepository extends MongoRepository<Category, String> {
    // Find category by name
    Optional<Category> findByName(String name);

    // Check if a category name already exists
    boolean existsByName(String name);
}
