package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.*;
import com.utez.mx.sgfpe.models.business.DTO.NewProductOrderRequest;
import com.utez.mx.sgfpe.repositories.business.NewProductOrderRepository;
import com.utez.mx.sgfpe.repositories.business.NewProductExpenseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewProductExpenseOrderService {

    @Autowired
    private NewProductExpenseRepository productRepo;

    @Autowired
    private NewProductOrderRepository orderRepo;

    public NewProductExpenseOrder createOrder(NewProductOrderRequest request) {
        List<NewProductExpenseOrderItem> items = new ArrayList<>();
        BigDecimal totalOrderCost = BigDecimal.ZERO;

        for (NewProductOrderRequest.ItemRequest itemRequest : request.getItems()) {
            // Buscar el producto original
            NewProductExpense product = productRepo.findById(itemRequest.getProductId())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + itemRequest.getProductId()));

            // Validar existencia suficiente
            if (product.getQuantity() < itemRequest.getQuantity()) {
                throw new RuntimeException("Inventario insuficiente para " + product.getProductDescription());
            }

            // Crear el item del pedido
            NewProductExpenseOrderItem orderItem = new NewProductExpenseOrderItem(
                    product.getId(),
                    product.getProductDescription(),
                    itemRequest.getQuantity(),
                    product.getUnitCost()
            );

            items.add(orderItem);
            totalOrderCost = totalOrderCost.add(orderItem.getTotalCost());

            // Restar inventario o eliminar producto
            double restante = product.getQuantity() - itemRequest.getQuantity();
            if (restante <= 0) {
                productRepo.delete(product);
            } else {
                product.setQuantity(restante);
                product.setTotalCost(product.getUnitCost().multiply(BigDecimal.valueOf(restante)));
                productRepo.save(product);
            }
        }

        // Crear el pedido
        NewProductExpenseOrder order = new NewProductExpenseOrder();
        order.setUserId(request.getUserId());
        order.setOrderDate(Instant.now());
        order.setItems(items);
        order.setOrderDescription(request.getOrderDescription());
        order.setTotalOrderCost(totalOrderCost);
        order.setIncome(request.getIncome());
        order.setNetProfit(request.getIncome().subtract(totalOrderCost));

        return orderRepo.save(order);
    }

    public List<NewProductExpenseOrder> getOrdersByUserId(String userId) {
        return orderRepo.findByUserId(userId);
    }

}

