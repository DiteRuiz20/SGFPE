package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.Debt;
import com.utez.mx.sgfpe.repositories.personal.DebtRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class DebtService {

    @Autowired
    private DebtRepository debtRepository;

    // Get all debts
    public List<Debt> getAllDebts() {
        return debtRepository.findAll();
    }

    // Get debt by ID
    public Optional<Debt> getDebtById(String id) {
        return debtRepository.findById(id);
    }

    // Get debts by user ID
    public List<Debt> getDebtsByUser(String userId) {
        return debtRepository.findByUserId(userId);
    }

    // Get debts by status (e.g., "pending", "paid")
    public List<Debt> getDebtsByStatus(String status) {
        return debtRepository.findByStatus(status);
    }

    // Save or update a debt
    public Debt saveOrUpdateDebt(Debt debt) {
        return debtRepository.save(debt);
    }

    // Delete debt by ID
    public void deleteDebtById(String id) {
        debtRepository.deleteById(id);
    }
}
