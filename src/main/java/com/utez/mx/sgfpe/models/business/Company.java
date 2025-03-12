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

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getOwnerUserId() {
        return ownerUserId;
    }

    public void setOwnerUserId(String ownerUserId) {
        this.ownerUserId = ownerUserId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
