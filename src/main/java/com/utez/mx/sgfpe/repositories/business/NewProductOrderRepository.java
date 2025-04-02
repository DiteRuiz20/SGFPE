package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.NewProductExpenseOrder;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NewProductOrderRepository extends MongoRepository<NewProductExpenseOrder, String> {
    List<NewProductExpenseOrder> findByUserId(String userId);

}
