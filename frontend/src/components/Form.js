import "../Styles/Form.css"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { useData } from "../Context/DataContext"
import { expenseAPI } from "../Services/api"

/**
 * Prvoides functionality to create a form that handles the addition of new expenses and editing existing expenses
 */

/**
 * @param {Object} props
 * @param {function} props.onExpenseAdded - Callback function when a new expense is added
 * @param {function} props.onExpenseEdited - Callback function when an existing expense is edited
 * @param {Object|null} props.editingExpense - Expense object being edited (null if creating a new expense)
 */

const Form = ({ onExpenseAdded, onExpenseEdited, editingExpense }) => {

  // State management

  const [name, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [budgetId, setBudgetId] = useState("")

  //Get budgets to modify them from the context file

  const { budgets, expenses } = useData()

  const categories = ["Housing", "Food", "Transportation", "Entertainment", "Healthcare", "Other"]


  /**
   * Pre-fills the form if editing an existing expense
   * Else clear the form
   */

  useEffect(() => {
    if (editingExpense) {
      setName(editingExpense.name || "")
      setAmount(editingExpense.amount || "")
      setCategory(editingExpense.category || "")
      setDescription(editingExpense.description || "")
      setDate(editingExpense.date || "")
      setBudgetId(editingExpense.budget?.id || null)
    } else {
      clearForm()
    }
  }, [editingExpense])

  const currentBudget = budgets.find(b => b.category === category)
  let budgetLeft = null
  if (currentBudget) {
    const spent = expenses.filter(expense => expense.category === category).reduce((sum, expense) => sum + expense.amount, 0)

    const typedAmount = parseFloat(amount) || 0
    budgetLeft = currentBudget.categoryLimit - spent - typedAmount
  }


  const start = currentBudget?.startDate ? new Date(currentBudget.startDate) : null
  const end = currentBudget?.endDate ? new Date(currentBudget.endDate) : null

  let durationMessage = ""
  if (start && end && date) {
    const selectedDate = new Date(date)
    if (selectedDate < start || selectedDate > end) {
      durationMessage = "⚠️This budget is currently not applied"
    }
    else {
      durationMessage = "✅Budget is applied"
    }
  }



  //Clears the form after submission

  const clearForm = () => {
    setName("")
    setAmount("")
    setCategory("")
    setDescription("")
    setDate("")
    setBudgetId("")
  }

  /**
   * @async
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */

  const handleSubmit = async (e) => {
    e.preventDefault()


    if (!name.trim() || !amount || !category || !date) {
      Swal.fire({
        title: "Form submission error",
        text: "Please fill in all required fields",
        icon: "error",
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonText: "OK",
        theme: "dark"
      })

      return
    }

    const selectedBudget = budgets.find(b => b.category === category)
    const expenseAmount = parseFloat(amount)
    const selectedDate = new Date(date)

    if (selectedBudget) {
      let isActive = true

      if (selectedBudget.startDate && selectedBudget.endDate) {
        isActive = selectedDate >= start && selectedDate <= end
      }

      if (isActive) {
        const spent = expenses.filter(expense => expense.category === category && expense.id !== editingExpense?.id).reduce((sum, expense) => sum + expense.amount, 0)
        const budgetLeft = selectedBudget.categoryLimit - spent

        if (expenseAmount > budgetLeft) {
          Swal.fire({
            title: "Budget Exceeded!",
            text: `This expense exceeds the budget by €${(expenseAmount - budgetLeft).toFixed(2)}`,
            icon: "error",
            allowOutsideClick: false,
            showConfirmButton: true,
            confirmButtonText: "OK",
            theme: "dark"
          })
          return
        }
      }
    }



    const requestBody = {
      id: editingExpense?.id,
      name: name.trim(),
      amount: parseFloat(amount),
      category: category,
      description: description.trim(),
      date: date,
      budgetId: selectedBudget?.id || null
    }




    try {
      if (editingExpense) {
        // Edit expense via API and update parent state
        const data = await expenseAPI.update(editingExpense.id, requestBody)
        onExpenseEdited(data)
        clearForm()

        Swal.fire({
          title: "Expense edited!",
          text: "Your expense was successfully edited!",
          icon: "success",
          allowOutsideClick: false,
          showConfirmButton: true,
          confirmButtonText: "OK",
          theme: "dark"
        })


      }

      else {
        // Create expense via API and update parent state
        const data = await expenseAPI.create(requestBody)
        onExpenseAdded(data)
        clearForm()

        Swal.fire({
          title: "Expense Added!",
          text: "Your expense was successfully added!",
          icon: "success",
          allowOutsideClick: false,
          showConfirmButton: true,
          confirmButtonText: "OK",
          theme: "dark"
        })

      }
    }
    catch {
      Swal.fire({
        title: "Server error",
        text: editingExpense ? "Couldnt edit the expense. Please try again later" : "Couldnt add the expense. Please try again later",
        icon: "error",
        allowOutsideClick: false,
        showConfirmButton: true,
        confirmButtonText: "OK",
        theme: "dark"
      })
    }

  }


  

  return (

    <form className="form" onSubmit={handleSubmit}>
      <div className="form-control">
        <label>Name *</label>
        <input
          type="text"
          placeholder="Name of expense"
          value={name}
          onChange={(e) => setName(e.target.value)}

        />
      </div>

      <div className="form-control">
        <label>Amount *</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Amount of expense"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}

        />
      </div>



      <div className="form-control">
        <label>Category *</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}

        >
          <option value="">Select a category</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {currentBudget && (
          <>
            <small style={{ fontWeight: "bold" }}>Budget for {category}: €{currentBudget.categoryLimit} </small>
            <small style={{ display: "block", color: budgetLeft < 0 ? "red" : "#4CAF50" }}>  {budgetLeft < 0 ? `⚠️Over budget by €${Math.abs(budgetLeft).toFixed(2)} ` : `Budget left: €${budgetLeft.toFixed(2)}`}</small>
            {currentBudget.startDate && <small style={{ color: "#20681aff", display: "block" }} > Start Date: {currentBudget.startDate}</small>}
            {currentBudget.endDate && <small style={{ color: "#20681aff", display: "block" }} > End Date: {currentBudget.endDate}</small>}
            {currentBudget.durationType === "WEEKLY" && <small>⏳Duration: WEEKLY</small>}
            {currentBudget.durationType === "MONTHLY" && <small>⏳Duration: MONTHLY</small>}
            <small style={{ color: durationMessage.includes("⚠️") ? "#ee160eff" : "#4CAF50" }} >{durationMessage}</small>


          </>
        )}

        {category && !currentBudget && (

          <small style={{ color: "#FF9800", display: "block" }}>⚠️No budget set for {category}</small>

        )}

      </div>

      <div className="form-control">
        <label>Description</label>
        <input
          type="text"
          placeholder="Description of expense"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label>Date *</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}

        />
      </div>

      <input
        type="submit"
        className="btn btn-submit"
        value={editingExpense ? "Update Expense" : "Add Expense"}
      />
    </form>

  )
}

export default Form