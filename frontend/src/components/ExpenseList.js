import "../Styles/List.css"
import { useState,useEffect} from "react"
import Button from "./Button"
import Form from "./Form"

/**
 * Provides functionality to create a table that holds all expenses
 */

/**
 * @param {Object} props
 * @param {Array<Object>} props.expenses- Array ff expense objects
 * @param {function} props.onDelete- Callback function when an existing expense is deleted
 * @param {function} props.onEdit - Callback function when an existing expense is deleted
 * 
 * @returns {JSX.Element} A table displaying all expenses with edit and delete functionality
 */

const ExpenseList = ({expenses, onDelete , onEdit}) => {

    const sortedExpenses = [...expenses].sort((a,b) => new Date(a.date) - new Date(b.date))
    const expenseTotal = expenses.reduce((sum,exp) => {
      return sum + exp.amount;
    },0)
  
return (
    <div className="scrollable">
    
    <table>
        <thead>
        <tr>
            <th>Edit</th>
            <th>Delete</th>
            <th>Name</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Description</th>
            <th>Date</th>
            <th>Recurring</th>
        </tr>
        </thead>
        <tbody>
            {sortedExpenses.map((expense) => (
                <tr key={expense.id}>
                    <td><Button text="Edit " className="btn-edit" onClick={() => onEdit(expense)} /></td>
                    <td><Button text="Delete" className="btn-delete" onClick={() => onDelete(expense.id)} /></td>
                    <td>{expense.name}</td>
                    <td>€{expense.amount}</td>
                    <td>{expense.category}</td>
                    <td>{expense.description}</td>
                    <td>{new Date(expense.date).toLocaleDateString()}</td>
                    <td>{expense.recurrenceType}</td>

                </tr> 
            )                  
        )}
        <tr className="total-row">
            <td><strong>Total:  €{expenseTotal}</strong></td>         
        </tr>
        </tbody>
        </table>  
        </div>
        
  )
}

export default ExpenseList
