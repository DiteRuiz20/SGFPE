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

            RawMaterial material = new RawMaterial();
            material.setUserId(userId);

            // ✅ Fecha con soporte para formato de fecha o string ISO
            Cell entryDateCell = row.getCell(0);
            if (entryDateCell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(entryDateCell)) {
                Date date = entryDateCell.getDateCellValue();
                material.setEntryDate(date.toInstant().atZone(ZoneId.systemDefault()).toInstant());
            } else if (entryDateCell.getCellType() == CellType.STRING) {
                String dateStr = entryDateCell.getStringCellValue();
                try {
                    material.setEntryDate(Instant.parse(dateStr));
                } catch (Exception e) {
                    throw new IllegalArgumentException("Formato de fecha inválido en fila " + (i + 1) + ": " + dateStr);
                }
            } else {
                throw new IllegalStateException("Tipo de celda de fecha no soportado en fila " + (i + 1));
            }

            material.setMaterialDescription(row.getCell(1).getStringCellValue());
            material.setSupplier(row.getCell(2).getStringCellValue());
            material.setQuantity(row.getCell(3).getNumericCellValue());
            material.setMeasurementUnit(row.getCell(4).getStringCellValue());
            material.setUnitPrice(BigDecimal.valueOf(row.getCell(5).getNumericCellValue()));
            material.setNotes(row.getCell(6) != null ? row.getCell(6).getStringCellValue() : "");

            materials.add(material);
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
