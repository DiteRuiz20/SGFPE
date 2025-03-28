package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.MaterialUsage;
import com.utez.mx.sgfpe.models.business.Order;
import com.utez.mx.sgfpe.repositories.business.MaterialUsageRepository;
import com.utez.mx.sgfpe.repositories.business.OrderRepository;
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
}
