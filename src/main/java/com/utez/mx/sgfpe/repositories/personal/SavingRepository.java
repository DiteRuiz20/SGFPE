package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.Saving;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.Instant;
import java.util.List;

@Repository // Marks this as a repository in Spring
public interface SavingRepository extends MongoRepository<Saving, String> {
    // Find savings by user ID
    List<Saving> findByUserId(String userId);

    // Find savings within a date range
    List<Saving> findByDateBetween(Instant startDate, Instant endDate);
}