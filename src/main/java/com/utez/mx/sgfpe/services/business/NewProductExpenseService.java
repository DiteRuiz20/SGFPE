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

            // Saltar filas vacías
            boolean rowIsEmpty = true;
            for (int j = 0; j <= 4; j++) {
                if (row.getCell(j) != null && row.getCell(j).getCellType() != CellType.BLANK) {
                    rowIsEmpty = false;
                    break;
                }
            }
            if (rowIsEmpty) continue;

            try {
                Cell c0 = row.getCell(0); // descripción
                Cell c1 = row.getCell(1); // cantidad
                Cell c2 = row.getCell(2); // unitCost
                Cell c3 = row.getCell(3); // categoría
                Cell c4 = row.getCell(4); // método de pago
                Cell c5 = row.getCell(5); // observaciones (opcional)

                if (c0 == null || c1 == null || c2 == null || c3 == null || c4 == null) continue;

                NewProductExpense expense = new NewProductExpense();
                expense.setUserId(userId);
                expense.setPurchaseDate(Instant.now());

                expense.setProductDescription(c0.getStringCellValue());
                int quantity = (int) c1.getNumericCellValue();
                BigDecimal unitCost = BigDecimal.valueOf(c2.getNumericCellValue());
                BigDecimal totalCost = unitCost.multiply(BigDecimal.valueOf(quantity));

                expense.setQuantity(quantity);
                expense.setUnitCost(unitCost);
                expense.setTotalCost(totalCost);
                expense.setCategory(c3.getStringCellValue());
                expense.setPaymentMethod(c4.getStringCellValue());
                expense.setNotes((c5 != null) ? c5.getStringCellValue() : "");

                expenses.add(expense);
            } catch (Exception e) {
                System.out.println("Error al procesar fila " + i + ": " + e.getMessage());
                // Puedes loguearlo o mostrar una advertencia
            }
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
