package com.utez.mx.sgfpe.security;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

import com.utez.mx.sgfpe.models.personal.DTO.RegistrationRequest;
import com.utez.mx.sgfpe.services.email.EmailService;
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
    private final EmailService emailService;

    public AuthController(UserService userService, JwtUtil jwtUtil, EmailService emailService) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
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
            return ResponseEntity.status(401).body(Map.of("error", "Credenciales inválidas"));
        }

        User user = optionalUser.get();

        // 🚫 Bloquear si no está verificado
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(403).body(Map.of("error", "Tu correo no ha sido verificado. Revisa tu bandeja de entrada 📩"));
        }

        String token = jwtUtil.generateToken(String.valueOf(user));

        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "accountType", user.getAccountType()
        ));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistrationRequest request) {
        try {
            String message = userService.registerUserWithVerification(request);
            return ResponseEntity.ok(Map.of("message", message));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (email == null || code == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email y código son requeridos"));
        }

        Optional<User> optionalUser = userService.getUserByEmail(email);

        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Usuario no encontrado"));
        }

        User user = optionalUser.get();

        if (user.isEmailVerified()) {
            return ResponseEntity.ok(Map.of("message", "El correo ya ha sido verificado"));
        }

        if (!code.equals(user.getVerificationCode())) {
            return ResponseEntity.status(400).body(Map.of("error", "Código de verificación incorrecto"));
        }

        user.setEmailVerified(true);
        user.setVerificationCode(null); // Limpia el código si quieres
        userService.updateUser(user); // Asegúrate de tener este método

        return ResponseEntity.ok(Map.of("message", "Correo verificado correctamente ✅"));
    }

    @PostMapping("/resend-code")
    public ResponseEntity<?> resendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo es obligatorio"));
        }

        Optional<User> optionalUser = userService.getUserByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "No se encontró ningún usuario con ese correo"));
        }

        User user = optionalUser.get();

        if (user.isEmailVerified()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Este correo ya fue verificado"));
        }

        // Generar un nuevo código
        String newCode = String.format("%06d", (int)(Math.random() * 1000000));
        user.setVerificationCode(newCode);
        userService.saveOrUpdateUser(user); // Guardamos el nuevo código

        // Enviamos el nuevo correo
        emailService.sendVerificationEmail(user.getEmail(), newCode);

        return ResponseEntity.ok(Map.of("message", "Nuevo código de verificación enviado"));
    }

    @PostMapping("/request-password-reset")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "El correo es obligatorio"));
        }

        Optional<User> optionalUser = userService.getUserByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Correo no encontrado"));
        }

        User user = optionalUser.get();

        // ✅ Validar que el correo esté verificado
        if (!user.isEmailVerified()) {
            return ResponseEntity.status(403).body(Map.of("error", "Tu correo aún no ha sido verificado"));
        }

        // 🚀 Generamos código y lo enviamos
        String code = String.format("%06d", (int) (Math.random() * 1000000));
        user.setResetPasswordCode(code);
        user.setResetCodeExpiry(new Date(System.currentTimeMillis() + 15 * 60 * 1000)); // 15 minutos
        userService.updateUser(user);

        emailService.sendEmail(user.getEmail(), "Restablecer contraseña", "Tu código es: " + code);

        return ResponseEntity.ok(Map.of("message", "Código enviado al correo 📩"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");
        String newPassword = request.get("newPassword");

        Optional<User> optionalUser = userService.getUserByEmail(email);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Correo no encontrado"));
        }

        User user = optionalUser.get();

        if (!code.equals(user.getResetPasswordCode())) {
            return ResponseEntity.status(400).body(Map.of("error", "Código incorrecto"));
        }

        if (user.getResetCodeExpiry() != null && user.getResetCodeExpiry().before(new Date())) {
            return ResponseEntity.status(400).body(Map.of("error", "El código ha expirado"));
        }

        user.setPassword(newPassword);
        user.setResetPasswordCode(null);
        user.setResetCodeExpiry(null);
        userService.updateUser(user);

        return ResponseEntity.ok(Map.of("message", "Contraseña restablecida con éxito"));
    }


}