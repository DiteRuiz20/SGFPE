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

    public Debt saveOrUpdateDebt(Debt debt) {
        if (debt.getId() == null) {
            // Es un create
            return debtRepository.save(debt);
        } else {
            // Es un update
            Optional<Debt> existing = debtRepository.findById(debt.getId());
            if (existing.isPresent()) {
                Debt existingDebt = existing.get();
                // Mantienes la fecha original
                debt.setDate(existingDebt.getDate());
                return debtRepository.save(debt);
            } else {
                throw new IllegalArgumentException("Debt with id " + debt.getId() + " not found");
            }
        }
    }

    // Delete debt by ID
    public void deleteDebtById(String id) {
        debtRepository.deleteById(id);
    }
}
