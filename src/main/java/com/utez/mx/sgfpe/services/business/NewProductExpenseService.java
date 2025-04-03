package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.NewProductExpense;
import com.utez.mx.sgfpe.repositories.business.NewProductExpenseRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;

@Service
public class NewProductExpenseService {

    @Autowired
    private NewProductExpenseRepository repository;

    public List<NewProductExpense> importFromExcel(MultipartFile file, String userId) throws IOException {
        List<NewProductExpense> expenses = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            NewProductExpense expense = new NewProductExpense();
            expense.setUserId(userId);
            expense.setPurchaseDate(Instant.now());

            expense.setProductDescription(row.getCell(0).getStringCellValue());

            int quantity = (int) row.getCell(1).getNumericCellValue();
            BigDecimal unitCost = BigDecimal.valueOf(row.getCell(2).getNumericCellValue()); // ← Cambiado a índice 2
            BigDecimal totalCost = unitCost.multiply(BigDecimal.valueOf(quantity));

            expense.setQuantity(quantity);
            expense.setUnitCost(unitCost);
            expense.setTotalCost(totalCost);

            expense.setCategory(row.getCell(3).getStringCellValue()); // ← Índice 3
            expense.setPaymentMethod(row.getCell(4).getStringCellValue()); // ← Índice 4

            Cell notesCell = row.getCell(5); // ← Índice 5
            expense.setNotes(notesCell != null ? notesCell.getStringCellValue() : "");

            expenses.add(expense);
        }

        workbook.close();
        return repository.saveAll(expenses);
    }

    public List<NewProductExpense> getAllByUser(String userId) {
        return repository.findByUserId(userId);
    }

    public NewProductExpense saveManualExpense(NewProductExpense expense) {
        // Si no trae totalCost, lo calculamos automáticamente
        if (expense.getTotalCost() == null && expense.getUnitCost() != null && expense.getQuantity() > 0) {
            BigDecimal total = expense.getUnitCost().multiply(BigDecimal.valueOf(expense.getQuantity()));
            expense.setTotalCost(total);
        }

        if (expense.getPurchaseDate() == null) {
            expense.setPurchaseDate(Instant.now());
        }

        return repository.save(expense);
    }

}
