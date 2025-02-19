package com.utez.mx.sgfpe.models.business;

import lombok.Data;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Data
@Document(collection = "companies") // MongoDB collection name
public class Company {

    @Id
    private ObjectId id; // Automatically generated unique identifier

    private String name; // Company name
    private String ownerUserId; // ID of the user who created the company
    private String type; // Type of company: "raw_materials" or "product_sales"
    private String description; // Description of the company

    // Default constructor required for MongoDB
    public Company() {
    }

    // Constructor with all attributes for easy instantiation
    public Company(String name, String ownerUserId, String type, String description) {
        this.name = name;
        this.ownerUserId = ownerUserId;
        this.type = type;
        this.description = description;
    }
}
