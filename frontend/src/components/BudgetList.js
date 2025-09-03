import "../Styles/List.css"
import { useState,useEffect} from "react"
import Button from "./Button"
import BudgetForm from "./Form"

/**
 * Provides functionality to create a table that holds all budgets
 */

/**
 * @param {Object} props
 * @param {Array<Object>} props.budgets- Array of budget objects
 * @param {function} props.onDelete- Callback function when an existing budget is deleted
 * @param {function} props.onEdit - Callback function when an existing budget is deleted
 * 
 * @returns {JSX.Element} A table displaying all budgets with edit and delete functionality
 */

const BudgetList = ({budgets, onDelete , onEdit}) => {
  
return (
    <table>
        <thead>
        <tr>
            <th>Edit</th>
            <th>Delete</th>
            <th>Category</th>
            <th>Limit</th>
            <th> Duration type</th>
            <th>Start Date</th>
            <th>End Date</th>
        </tr>
        </thead>
        <tbody>
            {budgets.map((budget) => (
                <tr key={budget.id}>
                    <td><Button  text="Edit " className="btn-edit" onClick={() => onEdit(budget)}/></td>
                    <td><Button  text="Delete" className="btn-delete" onClick={() => onDelete(budget.id)}/></td>
                    <td>{budget.category}</td>
                    <td>€{budget.categoryLimit}</td>
                    <td>{budget.durationType ? budget.durationType : "No duration set"}</td>
                    <td>{budget.durationType === "CUSTOM" ? budget.startDate : "No duration set"}</td>
                    <td>{budget.durationType === "CUSTOM" ? budget.endDate : "No duration set"}</td>
                </tr>     
            )                  
        )}
        </tbody>
        </table>  
  )
}

export default BudgetList