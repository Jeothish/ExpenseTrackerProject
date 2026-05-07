package com.example.ExpenseTracker.repository;

import com.example.ExpenseTracker.BudgetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository //Marks interface as a Repository so Spring can manage it

public interface BudgetRepo extends JpaRepository<BudgetEntity,Long> {  //JpaRepository provoids CRUD operations
  
} 