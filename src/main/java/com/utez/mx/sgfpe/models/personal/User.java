package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.Date;

@Data
@Document(collection = "users") // MongoDB collection for personal users
public class User {

    @Id
    private String id; // Unique identifier for each user

    private String name; // Name of the user
    private String email; // Email of the user (should be unique)
    private String password; // Password for authentication (store securely)
    private String phoneNumber; // Phone number for contact
    private String accountType;
    private String companyName;
    private String address;
    private boolean emailVerified = false;
    private String verificationCode;
    private String resetPasswordCode;
    private Date resetCodeExpiry; // Opcional para que expire

    // Default constructor required by MongoDB
    public User() {
    }

    // Constructor mínimo (el que estás usando)
    public User(String name, String email, String password, String phoneNumber, String accountType,
                String companyName, String address, String verificationCode, boolean emailVerified) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.accountType = accountType;
        this.companyName = companyName;
        this.address = address;
        this.verificationCode = verificationCode;
        this.emailVerified = emailVerified;
    }

    // Constructor completo (con reset password)
    public User(String name, String email, String password, String phoneNumber, String accountType,
                String companyName, String address, String verificationCode, boolean emailVerified,
                String resetPasswordCode, Date resetCodeExpiry) {
        this(name, email, password, phoneNumber, accountType, companyName, address, verificationCode, emailVerified);
        this.resetPasswordCode = resetPasswordCode;
        this.resetCodeExpiry = resetCodeExpiry;
    }

    // Constructor con ID (para updates)
    public User(String id, String name, String email, String password, String phoneNumber, String accountType,
                String companyName, String address, boolean emailVerified, String verificationCode) {
        this(name, email, password, phoneNumber, accountType, companyName, address, verificationCode, emailVerified);
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAccountType() {
        return accountType;
    }

    public void setAccountType(String accountType) {
        this.accountType = accountType;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public String getVerificationCode() {
        return verificationCode;
    }

    public void setVerificationCode(String verificationCode) {
        this.verificationCode = verificationCode;
    }

    public String getResetPasswordCode() {
        return resetPasswordCode;
    }

    public void setResetPasswordCode(String resetPasswordCode) {
        this.resetPasswordCode = resetPasswordCode;
    }

    public Date getResetCodeExpiry() {
        return resetCodeExpiry;
    }

    public void setResetCodeExpiry(Date resetCodeExpiry) {
        this.resetCodeExpiry = resetCodeExpiry;
    }
}