package com.utez.mx.sgfpe.security;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.utez.mx.sgfpe.models.personal.User;
import com.utez.mx.sgfpe.services.personal.UserService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/validate-account")
    public ResponseEntity<?> validateAccount(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String accountType = request.get("accountType");

        if (email == null || accountType == null) {
            return ResponseEntity.badRequest().body(Map.of(
                "isValid", false,
                "message", "Email and accountType are required"
            ));
        }

        Optional<User> userOptional = userService.getUserByEmail(email);
        
        if (userOptional.isEmpty()) {
            // Si el usuario no existe, consideramos válido para que el frontend
            // maneje el error de credenciales inválidas
            return ResponseEntity.ok(Map.of("isValid", true));
        }

        User user = userOptional.get();
        boolean isValid = user.getAccountType().equals(accountType);

        return ResponseEntity.ok(Map.of(
            "isValid", isValid,
            "actualAccountType", user.getAccountType()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        Optional<User> optionalUser = userService.getUserByEmail(email);

        if (optionalUser.isEmpty() || !optionalUser.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid credentials");
        }

        User user = optionalUser.get();

        String token = jwtUtil.generateToken(String.valueOf(user));

        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "accountType", user.getAccountType()
        ));
    }
}