package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.Debt;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface DebtRepository extends MongoRepository<Debt, String> {
    // Find debts by user ID
    List<Debt> findByUserId(String userId);

    // Find debts by status (e.g., "pending", "paid")
    List<Debt> findByStatus(String status);

    // Find debts by creditor's name
    List<Debt> findByCreditor(String creditor);
}
