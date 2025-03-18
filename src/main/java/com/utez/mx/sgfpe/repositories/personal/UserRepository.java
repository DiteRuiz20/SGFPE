package com.utez.mx.sgfpe.repositories.personal;

import com.utez.mx.sgfpe.models.personal.User;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository // Marks this as a repository in Spring
public interface UserRepository extends MongoRepository<User, String> {

    // Find user by email (for authentication or registration)
    Optional<User> findByEmail(String email);

    // Check if an email already exists
    boolean existsByEmail(String email);
}
