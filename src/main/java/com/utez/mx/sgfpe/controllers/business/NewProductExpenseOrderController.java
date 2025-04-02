package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.NewProductExpenseOrder;
import com.utez.mx.sgfpe.models.business.DTO.NewProductOrderRequest;
import com.utez.mx.sgfpe.services.business.NewProductExpenseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/new-product-orders")
public class NewProductExpenseOrderController {

    @Autowired
    private final NewProductExpenseOrderService orderService;

    public NewProductExpenseOrderController(NewProductExpenseOrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<NewProductExpenseOrder> createOrder(@RequestBody NewProductOrderRequest request) {
        NewProductExpenseOrder savedOrder = orderService.createOrder(request);
        return ResponseEntity.ok(savedOrder);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NewProductExpenseOrder>> getOrdersByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(orderService.getOrdersByUserId(userId));
    }
}