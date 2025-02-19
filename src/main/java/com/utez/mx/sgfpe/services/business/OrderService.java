package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.Order;
import com.utez.mx.sgfpe.repositories.business.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    // Get all orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Get order by ID
    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    // Get orders by company ID
    public List<Order> getOrdersByCompany(String companyId) {
        return orderRepository.findByCompanyId(companyId);
    }

    // Get orders by status (e.g., pending, completed, cancelled)
    public List<Order> getOrdersByStatus(String status) {
        return orderRepository.findByStatus(status);
    }

    // Save or update an order
    public Order saveOrUpdateOrder(Order order) {
        return orderRepository.save(order);
    }

    // Delete order by ID
    public void deleteOrderById(String id) {
        orderRepository.deleteById(id);
    }
}
