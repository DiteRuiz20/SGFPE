package com.utez.mx.sgfpe.security;

import com.utez.mx.sgfpe.models.personal.User;
import com.utez.mx.sgfpe.repositories.personal.UserRepository;
import com.utez.mx.sgfpe.services.personal.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
//@CrossOrigin(origins = "http://localhost:5173")// Base URL for user-related endpoints
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil; // Clase que genera tu JWT

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestParam String email, @RequestParam String password) {
        Optional<User> optionalUser = userService.getUserByEmail(email);

        if (optionalUser.isEmpty() || !optionalUser.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Credenciales inválidas");
        }

        User user = optionalUser.get();

        // Genera el token JWT
        String token = jwtUtil.generateToken(String.valueOf(user));

        // Responde con token y userId (Mongo usa String para ID)
        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId() // Mongo ID es String
        ));
    }
}