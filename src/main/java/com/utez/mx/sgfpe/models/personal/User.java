package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

@Data
@Document(collection = "users") // MongoDB collection for personal users
public class User {

    @Id
    private ObjectId id; // Unique identifier for each user

    private String name; // Name of the user
    private String email; // Email of the user (should be unique)
    private String password; // Password for authentication (store securely)
    private String phoneNumber; // Phone number for contact

    // Default constructor required by MongoDB
    public User() {
    }

    // Constructor with all attributes for easy instantiation
    public User(String name, String email, String password, String phoneNumber) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.phoneNumber = phoneNumber;
    }
}
