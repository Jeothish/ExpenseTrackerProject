/**
 * REST controller for managing expenses
 * 
 * Handles HTTP requests from the frontend.
 * Converts JSON input to Java objects
 * Calls ExpenseService to perform logic
 * Returns JSON responses back to frontend
 */

package com.example.ExpenseTracker;

import com.example.ExpenseTracker.ExpenseEntity;
import com.example.ExpenseTracker.ExpenseService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/expenses")
@CrossOrigin(origins = "http://localhost:3000")



public class ExpenseController{
    
    private final ExpenseService service;


    public ExpenseController(ExpenseService service){
        this.service = service;
    }

    /**
     * Create a new epxense under a specific budget
     * 
     * @param expense the expense details from the request body
     * @param budgetId Budget ID
     * @return The created expense with status 201
     */

    @PostMapping
    public ResponseEntity<ExpenseEntity> addExpense(@RequestBody ExpenseEntity expense , @RequestParam(required = false) Long budgetId){

        ExpenseEntity saved = service.addExpense(expense , budgetId);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    /**
     * Get all expenses
     * 
     * @return the list of all expenses
     */

    @GetMapping
    public List<ExpenseEntity> getAllExpenses(){
        return service.getAllExpenses();

    }

    /**
     * Deletes an expense by ID
     * 
     * @param id Expense ID
     * @return Confirmation message
     */

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteExpense(@PathVariable Long id){
        try{
            service.deleteExpense(id);
            return ResponseEntity.ok("Expense deleted successfully!");
        }
        catch(RuntimeException e){
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    /**
     * 
     * @param id Expense ID
     * @param expense Updates expense details
     * @param budgetId BudgtID
     * @return the updated expense
     */

    @PutMapping("/{id}")
    public ResponseEntity<ExpenseEntity> editExpense(@PathVariable Long id,@RequestBody ExpenseEntity expense , @RequestParam(required = false) Long budgetId){
        ExpenseEntity saved = service.editExpense(id,expense , budgetId);
        return new ResponseEntity<>(saved, HttpStatus.OK);
    }

    
}
