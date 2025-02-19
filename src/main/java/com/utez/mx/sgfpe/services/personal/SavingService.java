package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.Saving;
import com.utez.mx.sgfpe.repositories.personal.SavingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class SavingService {

    @Autowired
    private SavingRepository savingRepository;

    // Get all savings
    public List<Saving> getAllSavings() {
        return savingRepository.findAll();
    }

    // Get saving by ID
    public Optional<Saving> getSavingById(String id) {
        return savingRepository.findById(id);
    }

    // Get savings by user ID
    public List<Saving> getSavingsByUser(String userId) {
        return savingRepository.findByUserId(userId);
    }

    // Get savings by date range
    public List<Saving> getSavingsByDateRange(Instant startDate, Instant endDate) {
        return savingRepository.findByDateBetween(startDate, endDate);
    }

    // Save or update a saving
    public Saving saveOrUpdateSaving(Saving saving) {
        return savingRepository.save(saving);
    }

    // Delete saving by ID
    public void deleteSavingById(String id) {
        savingRepository.deleteById(id);
    }
}
