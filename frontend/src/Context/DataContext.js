import React, {createContext,useContext,useState,useEffect} from "react"
import { expenseAPI, budgetAPI, pythonAPI } from "../Services/api"
import Swal from "sweetalert2"

/**
 * Provoides centralised state management for expenses and budgets
 * Includes functions to load , add , update and delete data.
 */

const DataContext = createContext()

/**
 * Custom hook to access DataContext
 * @throws Will throw an error if used outside of a DataProvoider
 */

export const useData = () => {
    const context = useContext(DataContext)
    if(!context){
        throw new Error("useData must be used within a data proivder")
    }
    return context
}

export const DataProvider = ({children}) => {
    
    // State management
    const [expenses , setExpenses] = useState([])
    const [budgets , setBudgets] = useState([])
    const [insights,setInsights] = useState([])
    const [nextMonthTotal,setNextMonthTotal] = useState(null)
    const [nextMonthTotalByCategory,setNextMonthTotalByCategory] = useState([])

    // Loads expenses and budgets on render
    useEffect(() => {
        loadExpenses()
        loadBudgets()
        loadInsights()
        loadNextMonthTotal()
        loadNextMonthTotalByCategory()
    },[])

    /**
     * Loads all expenses from the backend API and updates state
     * @async
     * @returns {Promise<void>} Resolves when expenses are successfully loaded
     */
    
    const loadExpenses = async() => {
        try{
            const data = await expenseAPI.getAll()
            setExpenses(data)
        }
        catch(error){
            console.error("Failed to load expenses")
        }
    }

    /**
     * Loads all budgets from the backend API and updates state
     * @async
     * @returns {Promise<void>} Resolves when budgets are successfully loaded
     */

    const loadBudgets = async() => {
        try{
            const data = await budgetAPI.getAll()
            setBudgets(data)
        }
        catch(error){
            console.error("Failed to load budgets")
        }
    }

    const loadInsights = async() => {
        try{
            const data = await pythonAPI.getAll()
            setInsights(data)
        }
        catch(error){
            console.error("Failed to load insights")
        }
    }

    const loadNextMonthTotal = async() => {
        try{
            const data = await pythonAPI.getNextMonthTotal()
            setNextMonthTotal(data)
        }
        catch(error){
            console.error("Failed to load next months total")
        }
    }

    const loadNextMonthTotalByCategory = async() => {
        try{
            const data = await pythonAPI.getNextMonthCategory()
            setNextMonthTotalByCategory(data)
        }
        catch(error){
            console.error("Failed to load next months total by category")
        }
    }

    /**
     * Adds a new expense to the state
     * @param {Object} newExpense - The expense object to add
     */
    const addExpense = (newExpense) => {

        if(!newExpense || !newExpense.id){
            return
        }
        setExpenses(prev => [...prev,newExpense])
    }
    
    /**
     * Updates an exisiting expense in the state
     * @param {Object} updatedExpense 
     */
    const updateExpense = (updatedExpense) => {
        setExpenses(prev => prev.map(expense => expense.id === updatedExpense.id ? updatedExpense : expense))
    }

    /**
     * Deletes an expense and updates state
     * @async
     * @param {number|string} id - Expense ID
     * @returns {Promise<void>} - Resolves when expense is successfully deleted
     */

    const deleteExpense = async(id) => {
        try{
            await expenseAPI.delete(id)
            setExpenses(prev => prev.filter(exp => exp.id !== id))
        }

        catch(error){
            Swal.fire({
                title:"Error",
                text:"Coudltn delete the expense.Please try again later",
                icon:"error",
                allowOutsideClick: false,
                showConfirmButton:true,
                theme:"dark"
            })
        }
    }

    /**
     * Adds a new budget to the state
     * @param {Object} newBudget - The budget object to add
     */
    const addBudget = (newBudget) => {
        setBudgets(prev => [...prev,newBudget])
    }

    /**
     * Updates an existing budget in the state
     * @param {Object} updatedBudget
     */
    const updateBudget = (updatedBudget) => {
        setBudgets(prev => prev.map(budget => budget.id === updatedBudget.id ? updatedBudget : budget))
    }
    
    /**
     * Deletes a budget and updates state
     * @async
     * @param {Number|String} id - Budget ID
     * @returns {Promise<void>} - Resolves when budget is successfully deleted
     * 
     */

    const deleteBudget = async(id) => {
        try{
            await budgetAPI.delete(id)
            setBudgets(prev => prev.filter(bud => bud.id !== id))
        }

        catch(error){
            Swal.fire({
                title:"Error",
                text:"Couldnt delete the budget.Please try again later",
                icon:"error",
                allowOutsideClick: false,
                showConfirmButton:true,
                theme:"dark"
            })
        }
    }

    
    const availableCategories = Array.from(new Set(expenses.filter(exp => exp && exp.category).map(exp => exp.category)))
    const availableYears = Array.from(new Set(expenses.map(exp => new Date(exp.date).getFullYear()))).sort((a,b) => b - a)

    const value = {
        
        expenses,
        budgets,
        insights,
        nextMonthTotal,
        nextMonthTotalByCategory,
        availableCategories,
        availableYears,
        
        addExpense,
        updateExpense,
        deleteExpense,
        addBudget,
        updateBudget,
        deleteBudget,

        loadExpenses,
        loadBudgets,
        loadInsights,
        loadNextMonthTotal,
        loadNextMonthTotalByCategory,
    }

    return(
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    )    
}