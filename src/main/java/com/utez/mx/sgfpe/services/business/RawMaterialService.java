package com.utez.mx.sgfpe.services.business;

import com.utez.mx.sgfpe.models.business.RawMaterial;
import com.utez.mx.sgfpe.repositories.business.RawMaterialRepository;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class RawMaterialService {

    @Autowired
    private RawMaterialRepository rawMaterialRepository;

    // Get all raw materials
    public List<RawMaterial> getAllRawMaterials() {
        return rawMaterialRepository.findAll();
    }

    // Get raw material by ID
    public Optional<RawMaterial> getRawMaterialById(String id) {
        return rawMaterialRepository.findById(id);
    }

    // Get raw materials by supplier
    public List<RawMaterial> getRawMaterialsBySupplier(String supplier) {
        return rawMaterialRepository.findBySupplier(supplier);
    }

    // Obtener insumos por ID de usuario
    public List<RawMaterial> getRawMaterialsByUserId(String userId) {
        return rawMaterialRepository.findByUserId(userId);
    }

    // Get raw materials by date range
    public List<RawMaterial> getRawMaterialsByDateRange(Instant startDate, Instant endDate) {
        return rawMaterialRepository.findByEntryDateBetween(startDate, endDate);
    }

    // Save or update a raw material
    public RawMaterial saveOrUpdateRawMaterial(RawMaterial rawMaterial) {
        return rawMaterialRepository.save(rawMaterial);
    }

    // Delete raw material by ID
    public void deleteRawMaterialById(String id) {
        rawMaterialRepository.deleteById(id);
    }

    // Import raw materials from Excel file
    public List<RawMaterial> importRawMaterialsFromExcel(MultipartFile file, String userId) throws IOException {
        List<RawMaterial> materials = new ArrayList<>();
        Workbook workbook = new XSSFWorkbook(file.getInputStream());
        Sheet sheet = workbook.getSheetAt(0);

        for (int i = 1; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            // Saltar filas que estén completamente vacías
            boolean rowIsEmpty = true;
            for (int j = 0; j <= 4; j++) {
                if (row.getCell(j) != null && row.getCell(j).getCellType() != CellType.BLANK) {
                    rowIsEmpty = false;
                    break;
                }
            }
            if (rowIsEmpty) continue;

            try {
                RawMaterial material = new RawMaterial();
                material.setUserId(userId);
                material.setEntryDate(Instant.now());

                Cell c0 = row.getCell(0);
                Cell c1 = row.getCell(1);
                Cell c2 = row.getCell(2);
                Cell c3 = row.getCell(3);
                Cell c4 = row.getCell(4);
                Cell c5 = row.getCell(5);

                if (c0 == null || c1 == null || c2 == null || c3 == null || c4 == null) {
                    continue; // si alguna celda obligatoria está vacía, se salta
                }

                material.setMaterialDescription(c0.getStringCellValue());
                material.setSupplier(c1.getStringCellValue());
                material.setQuantity(c2.getNumericCellValue());
                material.setMeasurementUnit(c3.getStringCellValue());
                material.setUnitPrice(BigDecimal.valueOf(c4.getNumericCellValue()));
                material.setNotes((c5 != null) ? c5.getStringCellValue() : "");

                materials.add(material);
            } catch (Exception e) {
                // Si hay error con una fila, se ignora pero continúa
                System.out.println("Error procesando fila " + i + ": " + e.getMessage());
            }
        }

        workbook.close();
        return rawMaterialRepository.saveAll(materials);
    }

    public void consumeMaterial(String materialId, double quantity) throws Exception {
        Optional<RawMaterial> optional = rawMaterialRepository.findById(materialId);
        if (optional.isEmpty()) {
            throw new Exception("Materia prima no encontrada");
        }

        RawMaterial material = optional.get();

        if (quantity > material.getQuantity()) {
            throw new Exception("No hay suficiente cantidad disponible para consumir");
        }

        double newQuantity = material.getQuantity() - quantity;
        if (newQuantity == 0) {
            rawMaterialRepository.deleteById(materialId); // Se elimina al agotarse
        } else {
            material.setQuantity(newQuantity);
            rawMaterialRepository.save(material); // Se actualiza
        }
    }
}
