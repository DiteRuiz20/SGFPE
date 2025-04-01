package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.NewProductExpense;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NewProductExpenseRepository extends MongoRepository<NewProductExpense, String> {
    List<NewProductExpense> findByUserId(String userId);
}
