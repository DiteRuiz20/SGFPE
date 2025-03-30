package com.utez.mx.sgfpe.services.personal;

import com.utez.mx.sgfpe.models.personal.DTO.RegistrationRequest;
import com.utez.mx.sgfpe.models.personal.User;
import com.utez.mx.sgfpe.repositories.personal.UserRepository;
import com.utez.mx.sgfpe.services.email.EmailService;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service // Marks this as a Service in Spring
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

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

    public String registerUserWithVerification(RegistrationRequest request) {
        Optional<User> existingUser = getUserByEmail(request.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("Ya existe una cuenta con este correo.");
        }

        String code = generateVerificationCode();

        User user = new User(
                request.getName(),
                request.getEmail(),
                request.getPassword(),
                request.getPhoneNumber(),
                request.getAccountType(),
                request.getCompanyName(),
                request.getAddress(),
                code,
                false
        );


        userRepository.save(user);

        // Enviar código
        emailService.sendVerificationEmail(user.getEmail(), code);

        return "Código de verificación enviado al correo.";
    }

    public String generateVerificationCode() {
        int code = (int)(Math.random() * 900000) + 100000; // 6 dígitos
        return String.valueOf(code);
    }

    public void updateUser(User user) {
        userRepository.save(user);
    }

}
