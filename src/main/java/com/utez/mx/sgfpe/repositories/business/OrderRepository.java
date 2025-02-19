package com.utez.mx.sgfpe.repositories.business;

import com.utez.mx.sgfpe.models.business.Order;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface OrderRepository extends MongoRepository<Order, String> {
    // Find orders by company ID
    List<Order> findByCompanyId(String companyId);

    // Find orders by customer name
    List<Order> findByCustomerName(String customerName);

    // Find orders by status (e.g., pending, completed, cancelled)
    List<Order> findByStatus(String status);
}
