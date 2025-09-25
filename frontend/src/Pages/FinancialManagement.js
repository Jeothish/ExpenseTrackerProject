/**
 * Displays a list of budgets and allows the user to add,edit or delete budgets 
 * Connect with DataContext to update the global state
 */


import "../Styles/index.css"
import "../Styles/button.css"
import "../Styles/budget.css"
import Header from '../components/Header'
import { useState, useEffect } from 'react'
import Button from '../components/Button'

import Swal from 'sweetalert2'
import BudgetForm from '../components/BudgetForm'
import { useData } from '../Context/DataContext'
import BudgetList from '../components/BudgetList'

const Budget = () => {

    //Get budgets and functions to modify them from the context file
    const { budgets, expenses, addBudget, updateBudget, deleteBudget } = useData()

    //State management
    const [editingBudget, setEditingBudget] = useState(null)
    const [formState, setFormState] = useState(false)

    const categories = ["Housing", "Food", "Transportation", "Entertainment", "Healthcare", "Other"]

    //Toggle to display the form on/off
    const toggleForm = () => {
        setFormState(!formState)
        if (!formState) {
            setEditingBudget(null)
        }
    }



    const categoryTotal = budgets.reduce((totals, budget) => {
        const totalSpent = expenses.filter(expense => expense.category === budget.category).reduce((sum, expense) => sum + expense.amount, 0)
        totals[budget.category] = totalSpent
        return totals
    }, {})




    /**
     * Adds a new budget by calling the context function
     * @param {Object} newBudget - The budget object to add
     */
    const handleAddBudget = (newBudget) => {
        addBudget(newBudget)
        setFormState(false)
    }

    /**
     * Deletes a budget by calling the context function
     * @async
     * @param {Number|String} id - Budget ID
     */

    const handleDeleteBudget = async (id) => {
        try {
            await deleteBudget(id)
        }

        catch {
            Swal.fire({
                title: "Server error",
                text: "Couldnt delete the budget. Please try again later",
                icon: "error",
                allowOutsideClick: false,
                showConfirmButton: true,
                confirmButtonText: "OK",
                theme: "dark"
            })
        }
    }

    /**
     * Edits an existing budget by calling the context function
     * @param {Object} updatedBudget - The budget object with updated data
     */

    const handleEditBudget = (updatedBudget) => {
        updateBudget(updatedBudget)
        setEditingBudget(null)
        setFormState(false)
    }

    const handleEditClick = (expense) => {
        setEditingBudget(expense)
        setFormState(true)
    }

    const getCategoryIcon = (category) => {
        const icons = {
            "Housing": "🏠",
            "Food": "🍔",
            "Transportation": "🚗",
            "Entertainment": "🎮",
            "Healthcare": "💊",
            "Other": "💼"
        }
        return icons[category] || "💼"
    }


    const usedCategories = budgets.map(b => b.category)
    const availableCategories = categories.filter(c => !usedCategories.includes(c))


    return (
        <>

            <Header title="Financial Management" />
            
            
                
                    <div className="form-and-list-container">

                        {formState && (
                            <BudgetForm onBudgetAdded={handleAddBudget} onBudgetEdited={handleEditBudget} editingBudget={editingBudget} existingCategories={availableCategories} />
                        )}

                        <div className="table-and-button">
                            <div className='budget-grid'>
                                {budgets.map(budget => {
                                    const spent = categoryTotal[budget.category] || 0
                                    const percentage = Math.min((spent / budget.categoryLimit) * 100, 100)
                                    const remaining = budget.categoryLimit - spent

                                    let progressIndicator = "progress-safe"
                                    if (percentage >= 85) progressIndicator = "progress-danger"
                                    else if (percentage >= 60) progressIndicator = "progress-warning"

                                    return (
                                        <div key={budget.id} className='budget-card'>
                                            <div className='budget-card-header'>
                                                <div className='budget-icon'>
                                                    {getCategoryIcon(budget.category)}
                                                </div>
                                                <div className='budget-details'>
                                                    <h3>{budget.category}</h3>
                                                    <p>€{spent} of €{budget.categoryLimit} spent</p>
                                                </div>
                                            </div>

                                            <div className='budget-actions'>
                                                <Button className='btn-icon btn-edit' onClick={() => handleEditClick(budget)} text="✏️" />
                                                <Button className='btn-icon btn-delete' onClick={() => handleDeleteBudget(budget)} text="🗑️" />
                                            </div>


                                            <div className="progress-container">
                                                <div className='progress-bar'>
                                                    <div className={`progress-fill ${progressIndicator}`}
                                                        style={{ width: `${Math.min(percentage, 100)}%` }}>
                                                    </div>
                                                </div>

                                                <div className='budget-status'>
                                                    <span className='status-text'>
                                                        {remaining > 0 ? `✅You have €${remaining} remaining` : `⚠️You are €${Math.abs(remaining)} over the budget`}

                                                    </span>

                                                    <span className="status-percentage">{Math.round(percentage)}%</span>

                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>


                            <Button
                                text={formState ? "Close form" : "Add budget"}
                                onClick={toggleForm}
                                className={formState ? "btn-delete" : "btn-add"}
                            />
                        </div>
                    </div >
                
            



        </>
    )
}

export default Budget