package com.example.ExpenseTracker;

import com.example.ExpenseTracker.BudgetEntity;
import com.example.ExpenseTracker.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

/**
 * REST controller for managing budgets
 * Provides endpoints to create, read, update, and delete budgets
 */

@RestController
@RequestMapping("/budgets")
@CrossOrigin(origins = "http://localhost:3000")

public class BudgetController{
    private final BudgetService service;

    /**
     *Constructor for dependency injection of BudgetService
     
     * @param service the budget service object used to handle logic
     */

    public BudgetController(BudgetService service){
        this.service = service;
    }

    /**
     * 
     * @param budget the budget to save ( from request body )
     * @return ResponseEntity containing the saved budget
     */

    @PostMapping
    public ResponseEntity<BudgetEntity> addBudget(@RequestBody BudgetEntity budget){
        
        BudgetEntity saved = service.addBudget(budget);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Get a list of all budgets
     * 
     * @return List of all budget objects
     */

    @GetMapping
    public List<BudgetEntity> getAllBudgets(){
        return service.getAllBudgets();
    }

    /**
     * Delete a budget by its ID
     * 
     * @param id Budget ID
     * @return ResponseEntity with success message if deleted or 404 if the budget doesnt exist
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBudget(@PathVariable Long id){
        try{
            service.deleteBudget(id);
            return ResponseEntity.ok("Budget deleted successfully!");
        }
        catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * Edit an existing budget by its id
     * @param id Budget ID
     * @param budget Updated budget data from request body
     * @return  ResponseEntity containing the updated budget and HTTP status 200
     */

    @PutMapping("/{id}")
    public ResponseEntity<BudgetEntity> editBudget(@PathVariable Long id,@RequestBody BudgetEntity budget){
        BudgetEntity saved = service.editBudget(id,budget);
        return new ResponseEntity<>(saved, HttpStatus.OK);

    }



}
