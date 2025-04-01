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

            // Fecha de compra
            Cell dateCell = row.getCell(0);
            if (dateCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(dateCell)) {
                LocalDate localDate = dateCell.getDateCellValue().toInstant()
                        .atZone(ZoneId.systemDefault()).toLocalDate();
                expense.setPurchaseDate(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
            } else {
                throw new IllegalArgumentException("Formato de fecha inválido en fila " + (i + 1));
            }

            expense.setProductDescription(row.getCell(1).getStringCellValue());
            expense.setQuantity((int) row.getCell(2).getNumericCellValue());
            expense.setUnitCost(BigDecimal.valueOf(row.getCell(3).getNumericCellValue()));
            expense.setTotalCost(BigDecimal.valueOf(row.getCell(4).getNumericCellValue()));
            expense.setCategory(row.getCell(5).getStringCellValue());
            expense.setPaymentMethod(row.getCell(6).getStringCellValue());

            Cell notesCell = row.getCell(7);
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
