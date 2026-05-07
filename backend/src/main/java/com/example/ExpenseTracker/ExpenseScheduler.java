package com.example.ExpenseTracker;

import java.time.LocalDate;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ExpenseScheduler {
    private final ExpenseService expenseService;

    public ExpenseScheduler(ExpenseService expenseService){
        this.expenseService = expenseService;
    }

    @Scheduled(cron = "0 0 0 * * ?")
    public void processRecurringExpenses(){
        List<ExpenseEntity> expenses = expenseService.getAllExpenses();

        for(ExpenseEntity expense : expenses){

        if(expense.getRecurrenceType() != RecurrenceType.NONE && expense.getNextRecurrenceDate() != null && expense.getNextRecurrenceDate().equals(LocalDate.now())){

            ExpenseEntity expenseCopy = new ExpenseEntity();
            expenseCopy.setName(expense.getName());
            expenseCopy.setAmount(expense.getAmount());
            expenseCopy.setCategory(expense.getCategory());
            expenseCopy.setDescription(expense.getDescription());
            expenseCopy.setDate(LocalDate.now());
            expenseCopy.setBudget(expense.getBudget());
            expenseCopy.setRecurrenceType(expense.getRecurrenceType());
            expenseCopy.setRecurrenceInterval(expense.getRecurrenceInterval());

            LocalDate next = findNextRecurrenceDate(expense.getNextRecurrenceDate(), expense.getRecurrenceType(), expense.getRecurrenceInterval());

            expenseCopy.setNextRecurrenceDate(next);
            expense.setNextRecurrenceDate(next);

            expenseService.addExpense(expenseCopy, expense.getBudget().getId());

            expenseService.editExpense(expense.getId(), expense, expense.getBudget().getId());
            
            
        }
    }


    }
    
     public LocalDate findNextRecurrenceDate(LocalDate date, RecurrenceType recurrenceType, int recurrenceInterval){
        switch(recurrenceType){
            case DAILY:
            return date.plusDays(recurrenceInterval);
            

            case WEEKLY:
            return date.plusWeeks(recurrenceInterval);
            

            case MONTHLY:
            return date.plusMonths(recurrenceInterval);
        

            case YEARLY:
            return date.plusYears(recurrenceInterval);

            default:
            throw new IllegalArgumentException("Unknown recurrence type!");
            
        }
    }
}
