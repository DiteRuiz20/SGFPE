package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.PersonalExpense;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface PersonalExpenseRepository extends MongoRepository<PersonalExpense, String> {
    // Find expenses by user ID
    List<PersonalExpense> findByUserId(String userId);

    // Find expenses by category ID
    List<PersonalExpense> findByCategoryId(String categoryId);

    // Find expenses within a date range
    List<PersonalExpense> findByDateBetween(Instant startDate, Instant endDate);



}
