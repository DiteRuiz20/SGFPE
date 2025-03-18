package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

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

    // Default constructor required by MongoDB
    public User() {
    }

    // Constructor with all attributes for easy instantiation
    public User(String name, String email, String password, String phoneNumber, String accountType) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
        this.accountType = accountType;
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

}
