package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.Order;
import com.utez.mx.sgfpe.services.business.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody Map<String, Object> body) {
        try {
            String userId = (String) body.get("userId");
            String description = (String) body.get("orderDescription");
            List<String> usageIds = (List<String>) body.get("materialUsageIds");
            BigDecimal income = new BigDecimal(body.get("income").toString());

            Order order = orderService.createOrder(userId, description, usageIds, income);
            return ResponseEntity.ok(order);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable String id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}
