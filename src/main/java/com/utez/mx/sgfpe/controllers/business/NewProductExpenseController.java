package com.utez.mx.sgfpe.controllers.business;

import com.utez.mx.sgfpe.models.business.NewProductExpense;
import com.utez.mx.sgfpe.services.business.NewProductExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/new-product-expenses")
public class NewProductExpenseController {

    @Autowired
    private NewProductExpenseService expenseService;

    // Endpoint para importar desde Excel
    @PostMapping("/upload")
    public ResponseEntity<?> importFromExcel(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        try {
            List<NewProductExpense> imported = expenseService.importFromExcel(file, userId);
            return ResponseEntity.ok(imported);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error al procesar el archivo Excel: " + e.getMessage());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Error en los datos del archivo: " + e.getMessage());
        }
    }

    // Endpoint para obtener todos los gastos por usuario
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NewProductExpense>> getAllByUser(@PathVariable String userId) {
        return ResponseEntity.ok(expenseService.getAllByUser(userId));
    }

    // Endpoint para agregar manualmente un gasto de nueva mercancía
    @PostMapping
    public ResponseEntity<?> addNewProductExpense(@RequestBody NewProductExpense expense) {
        try {
            NewProductExpense saved = expenseService.saveManualExpense(expense);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error al guardar el gasto manual: " + e.getMessage());
        }
    }

}
