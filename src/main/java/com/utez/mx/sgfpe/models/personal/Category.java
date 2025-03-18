package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;

@Data
@Document(collection = "categories") // MongoDB collection for expense categories
public class Category {

    @Id
    private String id; // Unique identifier for each category

    private String name; // Name of the category (e.g., Food, Transportation)
    private String description; // Description of the category

    // Default constructor required by MongoDB
    public Category() {
    }

    // Constructor with all attributes for easy instantiation
    public Category(String name, String description) {
        this.name = name;
        this.description = description;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
