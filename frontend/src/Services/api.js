
import Swal
 from "sweetalert2"
const API_BASE_URL = "http://localhost:8080"
const API_FLASK_URL = "http://127.0.0.1:5000"

/**
 * API service for managing expenses
 * Provides CRUD operations (Create , Read, Update, Delete) against the backend "/expenses" endpoint
 */

export const expenseAPI = {
    
    /**
     * Fetch all expenses from the server
     * @returns {Promise<Array>} List of expenses
     * @throws {Error} if the request fails
     */


    getAll: async () => {
        try{
            const response = await fetch(`${API_BASE_URL}/expenses`)
            if(response.ok){
                return await response.json()
        }
            throw new Error("Server Error fetching expenses")
        }
        catch(error){
            console.error("Network error fetching expenses",error)
            throw error

        }
    },

    /**
     * Delete an expense by ID
     * @param {number|string} id - Expense ID
     * @returns {Promise<boolean>} true if successful
     * Displays an error alert if the request fails
     */


    delete:async (id) => {
        try{
            const response = await fetch(`${API_BASE_URL}/expenses/${id}` , {
                method:"DELETE"
            })
            if (response.ok){
                return true
            }
            
            Swal.fire({
                    title: "Server error",
                    text: "Couldnt delete the expense. Please try again later",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
                }
        catch{
            Swal.fire({
                    title: "Network error",
                    text: "Couldnt delete the expense. Please check your connection",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
        }
    },

    /**
     * Create a new expense which is linked to a budget
     * @param {object} expense - Expense object {name , amount , category , budgetId, date}
     * @returns {Promise<Object>}
     */

    create:async (expense) => {
        try{
            let url = `${API_BASE_URL}/expenses`
            if (expense.budgetId != null){
                url += `?budgetId=${expense.budgetId}`
            }
            const response = await fetch(url , {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(expense)
            })
            if (response.ok){
                return await response.json()
            }
            Swal.fire({
                    title: "Server error",
                    text: "Couldnt create the expense. Please try again later",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })

                }
        catch{
            Swal.fire({
                    title: "Network error",
                    text: "Couldnt create the expense. Please check your connection",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
        }
    },

    /**
     * 
     * @param {number|string} id - Expense ID
     * @param {Object} expense - Updated expense data
     * @returns {Promise<Object>} - The updated expense
     */

     update:async (id,expense) => {
        try{

            const response = await fetch(`${API_BASE_URL}/expenses/${id}` , {
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(expense)
            })
            
            if(!response.ok){
                const errorText = await response.text()
                throw new Error(errorText || "Server error updating expense")
            }

            return await response.json()
        }
           
        catch(error){
            throw error
            
        }
    }
}
    


/**
 * API service for managing budgets
 * Provides CRUD operations (Create , Read, Update, Delete) against the backend "/budgets" endpoint
 */

export const budgetAPI = {

    /**
     * Fetch all budgets
     * @returns {Promise<Array>} -List of budgets
     */

    getAll: async() => {
        try{
            const response = await fetch(`${API_BASE_URL}/budgets`)
            if(response.ok){
                return await response.json()
            }
            throw new Error("Server error fetching budgets")
        }
        catch(error){
            console.error("Network error fetching budgets:",error)
            throw error
        }
    },

    /**
     * Deletes a budget by ID
     * @param {number|string} id - Budget ID
     * @returns {Promise<boolean>} - true if successful
     */

    delete:async (id) => {
        try{
            const response = await fetch(`${API_BASE_URL}/budgets/${id}` , {
                method:"DELETE"
            })
            if (response.ok){
                return true
            }
            Swal.fire({
                    title: "Server error",
                    text: "Couldnt delete the budget. Please try again later",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
                }
        catch{
            Swal.fire({
                    title: "Network error",
                    text: "Couldnt delete the budget. Please check your connection",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
        }
    },

    /**
     * Creates a new budget
     * @param {Object} budget - Budget object {name,limit,category}
     * @returns {Promise<Object>} The created budget
     */

    create:async (budget) => {
        try{
            const response = await fetch(`${API_BASE_URL}/budgets` , {
                method:"POST",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(budget)
            })
            if (response.ok){
                return await response.json()
            }
            Swal.fire({
                    title: "Server error",
                    text: "Couldnt create the budget. Please try again later",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
                }
        catch{
            Swal.fire({
                    title: "Network error",
                    text: "Couldnt create the budget. Please check your connection",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
        }
    },

    /**
     * Updates a budget
     * @param {number|string} id - Budget ID
     * @param {Object} budget - Updated budget data
     * @returns {Promise<Object>} - The updated budget
     */

     update:async (id,budget) => {
        try{
            const response = await fetch(`${API_BASE_URL}/budgets/${id}` , {
                method:"PUT",
                headers:{"Content-Type":"application/json"},
                body: JSON.stringify(budget)
            })
            if (response.ok){
                return await response.json()
            }
            Swal.fire({
                    title: "Server error",
                    text: "Couldnt update the budget. Please try again later",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
                }
        catch{
            Swal.fire({
                    title: "Network error",
                    text: "Couldnt update the budget. Please check your connection",
                    icon: "error",
                    allowOutsideClick: false,
                    showConfirmButton: true,
                    confirmButtonText: "OK",
                    theme:"dark"
                  })
        }
    },
}


export const pythonAPI = {
    getAll: async() => {
        try{
            const response = await fetch(`${API_FLASK_URL}/insights`)
            if(response.ok){
                return await response.json()
            }
            throw new Error("Server error fetching insights")
        }
        catch(error){
            console.error("Network error fetching insights:",error)
            throw error
        }
    },

    getNextMonthTotal: async() => {
        try{
            const response = await fetch(`${API_FLASK_URL}/spending/total`)
            if(response.ok){
                return await response.json()
            }
            throw new Error("Server error fetching next months total")
        }
        catch(error){
            console.error("Network error fetching next months total:",error)
            throw error
        }
    },
    
    getNextMonthCategory: async() => {
        try{
            const response = await fetch(`${API_FLASK_URL}/spending/categories`)
            if(response.ok){
                return await response.json()
            }
            throw new Error("Server error fetching next months total by category")
        }
        catch(error){
            console.error("Network error fetching next months total by category:",error)
            throw error
        }
    }
}



