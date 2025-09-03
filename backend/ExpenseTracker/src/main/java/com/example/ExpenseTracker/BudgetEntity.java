package com.example.ExpenseTracker;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import lombok.AccessLevel;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonManagedReference;

/**
 * Represents a Budget and its details
 */

@Entity //Marks this class as a JPA entity
@Data // Lombok generates getters,setters,toString,equals,hashCode

public class BudgetEntity {
    @Id // Marks this field as a primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increments primary key
    private long id; 

    private String category;
    private double categoryLimit;

    private LocalDate startDate;
    private LocalDate endDate;

    private String durationType;

    /**
     * A budget can have many expenses but each expense belongs to one budget
     */

    @OneToMany(mappedBy = "budget") //Points to budget field inside ExpenseEntity
    @JsonManagedReference
    
    private List<ExpenseEntity> expenses;

    
    
}
