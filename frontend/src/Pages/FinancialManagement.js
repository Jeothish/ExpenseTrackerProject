/**
 * Displays a list of budgets and allows the user to add,edit or delete budgets 
 * Connect with DataContext to update the global state
 */

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


    const usedCategories = budgets.map(b => b.category)
    const availableCategories = categories.filter(c => !usedCategories.includes(c))

    return (
        <>

            <Header title="Financial Management" />
            <div className='chart-controls'>
                <div className="section-card">
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

                                    return (
                                        <div key={budget.id} className='budget-item'>
                                            < div className='budget-details' >
                                                <h3>{budget.category}</h3>
                                                <p>{spent} of {budget.categoryLimit}</p>
                                            </div>


                                            <div className="progress-container">
                                                <div className='progress-bar'>
                                                    <p>Remaining: ${remaining}</p>
                                                    <p>Ends at: ${budget.endDate}</p>
                                                </div>


                                            </div>

                                            <div className='budget-actions'>
                                                <button className='btn-edit' onClick={() => handleEditClick(budget)} title="Edit Budget" />
                                                <button className='btn-delete' onClick={() => handleDeleteBudget(budget)} title="Delete Budget" />
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
                </div>
            </div>



        </>
    )
}

export default Budget