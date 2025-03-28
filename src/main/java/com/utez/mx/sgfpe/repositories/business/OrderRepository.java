package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface OrderRepository extends MongoRepository<Order, String> {
    List<Order> findByUserId(String userId);
}
