/**
 * Repository for managing ExpenseEntity objects
 * 
 */

package com.example.ExpenseTracker.repository;

import com.example.ExpenseTracker.ExpenseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository //Marks interface as a Repository so Spring can manage it
public interface ExpenseRepo extends JpaRepository<ExpenseEntity,Long> {  //JpaRepository prvoids CRUD operations
  
  /**
   * 
   * @param budgetId Budget ID
   * @return List of expenses linked to that budget
   */
  
   List<ExpenseEntity> findByBudgetId(Long budgetId);
} 
    

