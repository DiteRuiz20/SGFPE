package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.Category;
import com.utez.mx.sgfpe.models.personal.PersonalExpense;
import com.utez.mx.sgfpe.repositories.personal.CategoryRepository;
import com.utez.mx.sgfpe.repositories.personal.PersonalExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.*;

@Service // Marks this as a Service in Spring
public class PersonalExpenseService {

    @Autowired
    private PersonalExpenseRepository personalExpenseRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    // Get all expenses with category name
    public List<Map<String, Object>> getAllExpenses() {
        List<PersonalExpense> expenses = personalExpenseRepository.findAll();
        List<Map<String, Object>> expensesWithCategory = new ArrayList<>();

        for (PersonalExpense expense : expenses) {
            Map<String, Object> expenseWithCategory = new HashMap<>();
            expenseWithCategory.put("id", expense.getId());
            expenseWithCategory.put("userId", expense.getUserId());
            expenseWithCategory.put("categoryId", expense.getCategoryId());
            expenseWithCategory.put("date", expense.getDate());
            expenseWithCategory.put("amount", expense.getAmount());
            expenseWithCategory.put("description", expense.getDescription());

            // Get category name
            Optional<Category> category = categoryRepository.findById(expense.getCategoryId());
            category.ifPresent(c -> expenseWithCategory.put("categoryName", c.getName()));

            expensesWithCategory.add(expenseWithCategory);
        }

        return expensesWithCategory;
    }

    public List<Map<String, Object>> getExpensesByUser(String userId) {
        List<PersonalExpense> expenses = personalExpenseRepository.findByUserId(userId);
        List<Map<String, Object>> expensesWithCategory = new ArrayList<>();

        for (PersonalExpense expense : expenses) {
            Map<String, Object> expenseWithCategory = new HashMap<>();
            expenseWithCategory.put("id", expense.getId());
            expenseWithCategory.put("userId", expense.getUserId());
            expenseWithCategory.put("categoryId", expense.getCategoryId());
            expenseWithCategory.put("date", expense.getDate());
            expenseWithCategory.put("amount", expense.getAmount());
            expenseWithCategory.put("description", expense.getDescription());

            // Obtener el nombre de la categoría
            Optional<Category> category = categoryRepository.findById(expense.getCategoryId());
            category.ifPresent(c -> expenseWithCategory.put("categoryName", c.getName()));

            expensesWithCategory.add(expenseWithCategory);
        }

        return expensesWithCategory;
    }

    // Get expense by ID
    public Optional<PersonalExpense> getExpenseById(String id) {
        return personalExpenseRepository.findById(id);
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

    // Find expenses by category
    public List<PersonalExpense> getExpensesByCategory(String categoryId) {
        return personalExpenseRepository.findByCategoryId(categoryId);
    }
}
