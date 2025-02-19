package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.User;
import com.utez.mx.sgfpe.repositories.personal.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // Get all users
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // Get user by ID
    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    // Get user by email (for authentication)
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    // Save or update a user
    public User saveOrUpdateUser(User user) {
        return userRepository.save(user);
    }

    // Delete user by ID
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
    }

    // Check if an email already exists
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }
}
