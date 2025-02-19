package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.PersonalExpense;
import com.utez.mx.sgfpe.repositories.personal.PersonalExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class PersonalExpenseService {

    @Autowired
    private PersonalExpenseRepository personalExpenseRepository;

    // Get all expenses
    public List<PersonalExpense> getAllExpenses() {
        return personalExpenseRepository.findAll();
    }

    // Get expense by ID
    public Optional<PersonalExpense> getExpenseById(String id) {
        return personalExpenseRepository.findById(id);
    }

    // Get expenses by user ID
    public List<PersonalExpense> getExpensesByUser(String userId) {
        return personalExpenseRepository.findByUserId(userId);
    }

    // Get expenses by date range
    public List<PersonalExpense> getExpensesByDateRange(Instant startDate, Instant endDate) {
        return personalExpenseRepository.findByDateBetween(startDate, endDate);
    }

    // Save or update an personalExpense
    public PersonalExpense saveOrUpdateExpense(PersonalExpense personalExpense) {
        return personalExpenseRepository.save(personalExpense);
    }

    // Delete expense by ID
    public void deleteExpenseById(String id) {
        personalExpenseRepository.deleteById(id);
    }
}
