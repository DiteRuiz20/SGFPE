package com.utez.mx.sgfpe.models.personal;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.bson.types.ObjectId;
import java.time.Instant;

@Data
@Document(collection = "personal_reports") // MongoDB collection for personal financial reports
public class Report {

    @Id
    private ObjectId id; // Unique identifier for each report

    private String userId; // ID of the user generating the report
    private Instant reportDate; // Date when the report is generated
    private String reportType; // Type of report: "monthly", "yearly", "custom"
    private String description; // Description or title of the report

    // Default constructor required by MongoDB
    public Report() {
    }

    // Constructor with all attributes for easy instantiation
    public Report(String userId, Instant reportDate, String reportType, String description) {
        this.userId = userId;
        this.reportDate = reportDate;
        this.reportType = reportType;
        this.description = description;
    }
}
