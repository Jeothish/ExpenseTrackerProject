

package com.example.ExpenseTracker;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonBackReference;
import java.time.LocalDate;

@Entity //Marks this class as a JPA entity so JPA knows that these objects will be stored in a table in a database
@Data  //Uses lombok to automatically generate getters and setters for the fields

public class ExpenseEntity {

    @Id //Marks field as primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY) //Autoincrements the primary key
    private Long id;

    private Double amount;
    private String category;
    private String name;
    private String description;
    private LocalDate date;

    @ManyToOne //An expense belons to one budget 
    @JoinColumn(name="budget_id") //Creates a foreign key column in the ExpenseEntity table which links to the BudgetEntity table
    @JsonBackReference //Avoids infinite loops in JSON serialization
    private BudgetEntity budget;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "recurrence_type")
    private RecurrenceType recurrenceType = RecurrenceType.NONE;
    
    @Column(name = "recurrence_interval")
    private Integer recurrenceInterval;

    @Column(name = "next_recurrence_date")
    private LocalDate nextRecurrenceDate;
   


}

