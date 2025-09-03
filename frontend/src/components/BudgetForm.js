
import "../Styles/Form.css"
import { useEffect, useState } from "react"
import Swal from "sweetalert2"
import { useData } from "../Context/DataContext"
import { budgetAPI } from "../Services/api"


/**
 * Prvoides functionality to create a form that handles the addition of new budgets and editing existing budgets
 */

/**
 * @param {Object} props
 * @param {function} props.onBudgetAdded - Callback function when a new budget is added
 * @param {function} props.onBudgetEdited - Callback function when an existing budget is edited
 * @param {Object|null} props.editingBudget - Budget object being edited (null if creating a new budget)
 * @param {Array} props.existingCategories - List of available categories that can be selected
 */

const BudgetForm = ({ onBudgetAdded, onBudgetEdited, editingBudget, existingCategories }) => {

  //State management

  const [category, setCategory] = useState("")
  const [categoryLimit, setCategoryLimit] = useState("")
  const [budgetDuration, setBudgetDuration] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")


  /**
   * Pre-fills the form if editing an existing budget
   * Else clear the form
   */

  useEffect(() => {
    if (editingBudget) {
      setCategory(editingBudget.category || "")
      setCategoryLimit(editingBudget.categoryLimit || "")
      setBudgetDuration(editingBudget.durationType || "")
      setStartDate(editingBudget.startDate || "")
      setEndDate(editingBudget.endDate || "")
    }
    else {
      clearForm()
    }
  }, [editingBudget])


  //Clears form after submission

  const clearForm = () => {
    setCategory("")
    setCategoryLimit("")
    setBudgetDuration("")
    setStartDate("")
    setEndDate("")
  }

  /**
   * @async
   * @param {React.FormEvent} e - The form submission event
   * @returns {Promise<void>}
   */

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!category.trim() || !category || parseFloat(categoryLimit) <= 0) {
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

    const requestBody = {
      category: category,
      categoryLimit: parseFloat(categoryLimit),
      durationType: budgetDuration,
      startDate: budgetDuration === "CUSTOM" ? startDate : null,
      endDate: budgetDuration === "CUSTOM" ? endDate : null
    }


    try {
      if (editingBudget) {
        // Edit expense via API and update parent state
        const data = await budgetAPI.update(editingBudget.id, requestBody)
        onBudgetEdited(data)
        clearForm()
      }

      else {
        // Create expense via API and update parent state
        const data = await budgetAPI.create(requestBody)
        onBudgetAdded(data)
        clearForm()
      }
    }
    catch {
      Swal.fire({
        title: "Server error",
        text: editingBudget ? "Couldnt edit the budget. Please try again later" : "Couldnt add the budget. Please try again later",
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
        <label>Category*</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select a category</option>
          {existingCategories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="form-control">
        <label>Limit*</label>
        <input
          type="number"
          step="0.01"
          min="0"
          placeholder="Limit"
          value={categoryLimit}
          onChange={(e) => setCategoryLimit(e.target.value)}
        />
      </div>

      <div className="form-control">
        <label>Budget</label>
        <select
          value={budgetDuration}
          onChange={(e) => setBudgetDuration(e.target.value)}
        >
          <option value="">Select the budget duration</option>
          <option value="WEEKLY">Weekly</option>
          <option value="MONTHLY">Monthly</option>
          <option value="CUSTOM">Custom</option>
        </select>

        


        {budgetDuration === "CUSTOM" && (
          <>
            <label>Select start date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <label>Select end date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </> 
          )}


      </div>



      <input
        type="submit"
        className="btn btn-submit"
        value={editingBudget ? "Update budget" : "Add Budget"}
      />
    </form>
  )
}

export default BudgetForm