package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import com.utez.mx.sgfpe.models.business.NewProductExpense;
import com.utez.mx.sgfpe.models.business.Order;
import com.utez.mx.sgfpe.repositories.business.MaterialUsageRepository;
import com.utez.mx.sgfpe.repositories.business.OrderRepository;
import com.utez.mx.sgfpe.repositories.business.NewProductExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private NewProductExpenseRepository newProductExpenseRepository;

    @Autowired
    private MaterialUsageRepository materialUsageRepository;

    public Order createOrder(String userId, String description, List<String> usageIds, BigDecimal income) throws Exception {
        List<MaterialUsage> usages = materialUsageRepository.findAllById(usageIds);

        if (usages.size() != usageIds.size()) {
            throw new Exception("Algunos insumos no fueron encontrados");
        }

        // 🚨 VALIDAR si ya fueron usados
        boolean algunoUsado = usages.stream().anyMatch(MaterialUsage::isUsedInOrder);
        if (algunoUsado) {
            throw new Exception("Uno o más insumos ya fueron usados en otro pedido");
        }

        // Marcar como usados
        usages.forEach(u -> u.setUsedInOrder(true));
        materialUsageRepository.saveAll(usages); // Guardar cambios

        BigDecimal totalUsageCost = usages.stream()
                .map(MaterialUsage::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = income.subtract(totalUsageCost);

        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDescription(description);
        order.setMaterialUsageIds(usageIds);
        order.setIncome(income);
        order.setNetProfit(netProfit);
        order.setCreatedAt(java.time.Instant.now());

        return orderRepository.save(order);
    }

    public List<Order> getOrdersByUserId(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }

    public Order createOrderFromNewProductExpenses(String userId, String description, List<String> productExpenseIds, BigDecimal income) throws Exception {
        List<NewProductExpense> products = newProductExpenseRepository.findAllById(productExpenseIds);

        if (products.size() != productExpenseIds.size()) {
            throw new Exception("Algunos productos no fueron encontrados");
        }

        BigDecimal totalCost = products.stream()
                .map(NewProductExpense::getTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal netProfit = income.subtract(totalCost);

        Order order = new Order();
        order.setUserId(userId);
        order.setOrderDescription(description);
        order.setNewProductExpenseIds(productExpenseIds);
        order.setIncome(income);
        order.setNetProfit(netProfit);
        order.setCreatedAt(java.time.Instant.now());

        // Reducir cantidad o eliminar
        for (NewProductExpense product : products) {
            double newQuantity = product.getQuantity() - 1;
            if (newQuantity <= 0) {
                newProductExpenseRepository.deleteById(product.getId());
            } else {
                product.setQuantity(newQuantity);
                newProductExpenseRepository.save(product);
            }
        }

        return orderRepository.save(order);
    }

}
