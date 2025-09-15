/**
 * Responsible for handling all the logic with this project like validation and calculations
 * Processes data coming from the controller
 * Calls Repository to save or fetch data from the databse
 * 
 */
package com.example.ExpenseTracker;
import com.example.ExpenseTracker.BudgetEntity;
import com.example.ExpenseTracker.ExpenseEntity;
import com.example.ExpenseTracker.repository.ExpenseRepo;
import com.example.ExpenseTracker.repository.BudgetRepo;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class ExpenseService {
    private ExpenseRepo repository; //Define repository
    private BudgetRepo budgetRepository;

    public ExpenseService(ExpenseRepo repository, BudgetRepo budgetRepository) {
        this.repository = repository;
        this.budgetRepository = budgetRepository;

    }

    /**
     * 
     * @param expense  the expense entity containing details
     * @param budgetId Budget ID
     * @return The saved expense
     * @throws ResponseStatusException if validation fails
     */

    public ExpenseEntity addExpense(ExpenseEntity expense, Long budgetId) {
        if (expense.getAmount() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Expense cannot be negative");
        }

        if (budgetId != null) {
            BudgetEntity budget = budgetRepository.findById(budgetId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));

            List<ExpenseEntity> existingExpenses = repository.findByBudgetId(budgetId);
            double totalExistingAmount = existingExpenses.stream()
                    .mapToDouble(ExpenseEntity::getAmount)
                    .sum();

            double newTotal = totalExistingAmount + expense.getAmount();
            if (newTotal > budget.getCategoryLimit()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, String.format(
                        "Adding this expense would exceed budget limit. Current total: %.2f, Budget limit: %.2f, New expense: %.2f",
                        totalExistingAmount, budget.getCategoryLimit(), expense.getAmount()));
            }

            expense.setBudget(budget);
        }

        
        return repository.save(expense);

    }

   
    /**
     * Deletes an expense by its id
     * 
     * @param id Expense ID
     * @throws ResponseStatusException Exception thrown if expense doesnt exist
     */

    public void deleteExpense(Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found");
        } else {
            repository.deleteById(id);
        }
    }

    /**
     * Edits an existing expense with new details
     * 
     * @param id             Expense ID
     * @param updatedExpense Expense with updated data
     * @param budgetId       Budget ID
     * @return Updated expense
     * @throws ResponseStatusException if validation fails
     */
    public ExpenseEntity editExpense(Long id, ExpenseEntity updatedExpense, Long budgetId) {

        ExpenseEntity existingExpense = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Expense not found"));

        if (budgetId == null) {
            budgetId = existingExpense.getBudget().getId();
        }

        BudgetEntity budget = budgetRepository.findById(budgetId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));

        List<ExpenseEntity> existingExpenses = repository.findByBudgetId(budgetId);
        double totalExistingAmount = existingExpenses.stream()
                .filter(exp -> !exp.getId().equals(id))
                .mapToDouble(ExpenseEntity::getAmount)
                .sum();

        double newTotal = totalExistingAmount + updatedExpense.getAmount();
        if (newTotal > budget.getCategoryLimit()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, String.format(
                    "Adding this expense would exceed budget limit. Current total: %.2f, Budget limit: %.2f, updated expense: %.2f",
                    totalExistingAmount, budget.getCategoryLimit(), updatedExpense.getAmount()));
        }

        existingExpense.setName(updatedExpense.getName());
        existingExpense.setAmount(updatedExpense.getAmount());
        existingExpense.setCategory(updatedExpense.getCategory());
        existingExpense.setDescription(updatedExpense.getDescription());
        existingExpense.setDate(updatedExpense.getDate());
        existingExpense.setBudget(budget);

        return repository.save(existingExpense);

    }

    /**
     * Fetches all expenses
     * 
     * @return a list of all expenses
     */
    public List<ExpenseEntity> getAllExpenses() {
        return repository.findAll();
    }

}
