package com.example.ExpenseTracker;


import com.example.ExpenseTracker.BudgetEntity;
import com.example.ExpenseTracker.repository.ExpenseRepo;
import com.example.ExpenseTracker.repository.BudgetRepo;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

/**
 * Service layer for managing budget-related operations
 * Provides functionality to create, update, delete and fetch budgets
 */

@Service
public class BudgetService {
    private BudgetRepo repository;
    private ExpenseRepo expenseRepository;

    /**
     * Constructor for dependency injection of repositories
     * @param repository Repository for budgets
     * @param expenseRepository Repository for expenses
     */

    public BudgetService(BudgetRepo repository , ExpenseRepo expenseRepository){
        this.repository = repository;
        this.expenseRepository = expenseRepository;

    }

    /**
     * Adds a new budget to the database
     * @param budget the budget entity containing details
     * @return The saved budget 
     */

    public BudgetEntity addBudget(BudgetEntity budget){
        if(budget.getCategoryLimit() < 0){
            throw new RuntimeException("Budget can not be negative!");
        }

        if(budget.getDurationType().equals("WEEKLY")){
            budget.setStartDate(LocalDate.now());
            budget.setEndDate(LocalDate.now().plusWeeks(1));
        }

        else if(budget.getDurationType().equals("MONTHLY")){
            budget.setStartDate(LocalDate.now());
            budget.setEndDate(LocalDate.now().plusMonths(1));
        }

        else if(budget.getDurationType().equals("CUSTOM")){
            
            if(budget.getStartDate() == null || budget.getEndDate() == null){
                throw new RuntimeException("Custom budget requires start and end dates");
            }
        }
        return repository.save(budget);
        
    }

    /**
     * Deletes a budget by its ID
     * @param id Budget ID
     */

    public void deleteBudget(Long id){
        if (!repository.existsById(id)) {
            throw new RuntimeException("Budget with ID " + id + " not found!");
        }

        List<ExpenseEntity> associatedExpenses = expenseRepository.findByBudgetId(id);
        if(!associatedExpenses.isEmpty()){
            throw new RuntimeException("Cannot delete budget: There are" + associatedExpenses.size() + "expenses associated with this budget. Please delete this budget first");
        }
        
        repository.deleteById(id);
        }
        
    /**
     * Edits an existing budget
     * 
     * @param id Budget ID
     * @param updatedBudget Budget object with new values
     * @return Updated budget
     */

    public BudgetEntity editBudget (Long id , BudgetEntity updatedBudget){
        BudgetEntity existingBudget = repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Budget not found with id" + id));
        
        existingBudget.setCategory(updatedBudget.getCategory());
        existingBudget.setCategoryLimit(updatedBudget.getCategoryLimit());
        existingBudget.setStartDate(updatedBudget.getStartDate());
        existingBudget.setEndDate(updatedBudget.getEndDate());
        existingBudget.setDurationType((updatedBudget.getDurationType()));

        return repository.save(existingBudget);
    }    
    

    /**
     * Fetches all budgets from the database
     * @return A list of all budgets
     */
    
     public List<BudgetEntity> getAllBudgets(){
        return repository.findAll();
    }

    
}
