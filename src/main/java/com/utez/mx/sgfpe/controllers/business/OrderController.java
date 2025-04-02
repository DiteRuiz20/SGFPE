package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.DTO.NewProductOrderRequest;
import com.utez.mx.sgfpe.models.business.DTO.OrderRequest;
import com.utez.mx.sgfpe.models.business.Order;
import com.utez.mx.sgfpe.services.business.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/create")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest request) {
        try {
            Order created = orderService.createOrder(
                    request.getUserId(),
                    request.getOrderDescription(),
                    request.getMaterialUsageIds(),
                    request.getIncome()
            );
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

//    @PostMapping("/from-new-product")
//    public ResponseEntity<?> createOrderFromNewProductExpenses(@RequestBody NewProductOrderRequest request) {
//        try {
//            Order order = orderService.createOrderFromNewProductExpenses(
//                    request.getUserId(),
//                    request.getOrderDescription(),
//                    request.getNewProductExpenseIds(),
//                    request.getIncome()
//            );
//            return ResponseEntity.ok(order);
//        } catch (Exception e) {
//            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
//        }
//    }

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
