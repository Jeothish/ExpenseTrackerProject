/**
 * Displays a list of budgets and allows the user to add,edit or delete budgets 
 * Connect with DataContext to update the global state
 */

import "../Styles/List.css"
import "../Styles/index.css"

import { useState, useEffect, useRef } from "react"
import Header from "../components/Header"
import Button from '../components/Button'
import Form from '../components/Form'
import ExpenseList from "../components/ExpenseList"
import Swal from "sweetalert2"
import { useData } from "../Context/DataContext"
import { useChartData } from '../Hooks/useChartData'
import Chart from '../components/Chart'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'



const ExpenseTracker = () => {

  const [month, setMonth] = useState("")
  const [year, setYear] = useState(new Date().getFullYear())
  const [formState, setFormState] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)

  //Refs for capturing chart elements
  const monthlyExpensesRef = useRef(null)
  const monthlyCountRef = useRef(null)
  const categoryMonthlyRef = useRef(null)
  const categoryTotalRef = useRef(null)

  // Get expenses and functions to modify them from the context file
  const { expenses, addExpense, updateExpense, deleteExpense, availableYears } = useData()

  // Hook for chart-related data
  const {
    availableCategories,
    budgets,
    categoryColors,
    monthlyExpensesData,
    monthlyCountData,
    categoryMonthlyData,
    categoryTotalData,
    setSelectedYear,
    yearExpenses
  } = useChartData(year)

  useEffect(() => {
    setSelectedYear(year)
  }, [year, setSelectedYear])



  const filteredExpenses = expenses.filter(exp => {
    const date = new Date(exp.date)
    return (month ? date.getMonth() === month : true) && date.getFullYear() === year
  })

  const availableMonths = Array.from(new Set(expenses.filter(exp => new Date(exp.date).getFullYear() === year)
    .map(exp => new Date(exp.date).getMonth())))

  //Total expense amount for filtered expenses
  const expenseTotal = filteredExpenses.reduce((sum, exp) => {
    return sum + exp.amount;
  }, 0)


  // Used to display the form on and off
  const toggleForm = () => {
    setFormState(!formState)
    if (!formState) {
      setEditingExpense(null)
    }
  }

  /**
   * Adds a new epxense by calling the context function
   * @param {Object} newExpense - the new expense object to add
   */

  const handleAddExpense = (newExpense) => {
    addExpense(newExpense)
    setFormState(false)
  }

  /**
   * Edits an existing epxense by calling the context function
   * @param {Object} updatedExpense - the updated expense object to add
   */

  const handleEditExpense = (updatedExpense) => {
    updateExpense(updatedExpense)
    setEditingExpense(null)
    setFormState(false)
  }

  /**
   * Handles the click even for the Edit button
   * @param {Object} expense - The expense object to edit
   */

  const handleEditClick = (expense) => {
    setEditingExpense(expense)
    setFormState(true)
  }

  /**
     * 
     * @param {React.RefObject} chartRef - Reference to chart container
     * @param {*} options 
     * @returns {Promise<HTMLCanvasElement|null>}
     */
  const captureChart = async (chartRef, options = {}) => {
    if (!chartRef.current) {
      return null
    }

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
        allowTaint: true,
        ...options
      })
      return canvas
    }
    catch (error) {
      console.error("Error capturing chart:", error)
      return null;
    }
  }


  /**
   * @async
   * Export expenses and charts into a PDF
   */

  const exportPDF = async () => {
    const doc = new jsPDF();
    let currentY = 22

    // Title
    doc.setFontSize(18)
    doc.text("Expenses Report", 14, 22)
    currentY += 10

    // Filter text
    const filterText = month !== "" ? `Month: ${new Date(0, month).toLocaleDateString("default", { month: "long" })}, Year: ${year}` : `Year: ${year}`
    doc.setFontSize(12)
    doc.text(filterText, 14, 30)
    currentY += 15

    // Table with expenses
    const tableColumn = ["Name", "Amount", "Category", "Description", "Date"]
    const tableRows = []

    filteredExpenses.forEach(exp => {
      const expenseData = [
        exp.name,
        `€${exp.amount.toFixed(2)}`,
        exp.category,
        exp.description,
        new Date(exp.date).toLocaleDateString()
      ]
      tableRows.push(expenseData)
    })
    tableRows.push(["Total", `€${expenseTotal.toFixed(2)}`, "", "", ""])

    autoTable(doc, {
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didParseCell: (data) => {
        // Style last row
        if (data.row.index === tableRows.length - 1) {
          data.cell.styles.fontStyle = "bold"
          data.cell.styles.textColor = [255, 0, 0]
        }
      }
    })

    // Charts to include in the pdf
    const charts = [
      { ref: monthlyExpensesRef, title: "Monthly Expense Amounts" },
      { ref: monthlyCountRef, title: "Number of expenses per Month" },
      { ref: categoryMonthlyRef, title: "Category of Breakdown by Month" },
      { ref: categoryTotalRef, title: "Total by category" },
    ]
    // Add charts one by one
    for (let i = 0; i < charts.length; i++) {
      const { ref, title } = charts[i]

      if (i === 0) {
        doc.addPage()
        currentY = 20
      }
      else if (currentY > 200) {
        doc.addPage()
        currentY = 20
      }

      doc.setFontSize(14)
      doc.text(title, 14, currentY)
      currentY += 10

      const chartCanvas = await captureChart(ref)
      if (chartCanvas) {
        const imgData = chartCanvas.toDataURL("image/png")
        doc.addImage(imgData, "PNG", 14, currentY, 180, 90)
        currentY += 100
      }
    }
    //Generate filename
    const monthName = month !== "" ? new Date(0, month).toLocaleString("default", { month: "long" }) : "AllMonths"
    const fileName = `expenses_report_${monthName}_${year}.pdf`

    doc.save(fileName)
  }

  /**
   * Export expenses into a CSV file
   */

  const exportCSV = () => {
    const headers = ["Name", "Amount", "Category", "Description", "Date"]
    const rows = filteredExpenses.map(exp => [
      exp.name,
      `€${exp.amount.toFixed(2)}`,
      exp.category,
      exp.description,
      new Date(exp.date).toLocaleDateString()
    ])

    rows.push(["Total", expenseTotal.toFixed(2), "", "", ""])

    const csvContent = [headers, ...rows]
      .map(e => e.map(cell => `"${cell}"`).join(","))
      .join("\n")

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a")
    const monthPart = month !== "" ? new Date(0, month).toLocaleString("default", { month: "long" }) : "AllMonths"


    link.setAttribute("href", URL.createObjectURL(blob))
    link.setAttribute("download", `expenses-report-${monthPart}_${year}.csv`)
    link.click()
  }

  return (
    <>
     <Header title="Expense Tracker" />
      <div className="chart-controls">
       
        
      
        <label>Select year:</label>
        <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
          {availableYears.map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        

        {/*Month filter*/}
      
        <label>Select month:</label>
        <select value={month} onChange={(e) => setMonth(Number(e.target.value))}>
          <option value="">All</option>
          {availableMonths.map(m => (
            <option key={m} value={m}> {new Date(0, m).toLocaleString("default", { month: "long" })}</option>
          ))}
        </select>
        

        <div className="section-card">


        <div className="form-and-list-container">
          {formState && (
            <Form
              onExpenseAdded={handleAddExpense}
              onExpenseEdited={handleEditExpense}
              editingExpense={editingExpense}
            />
          )}
          <div className="table-and-button">
            <div className="scrollable">
            <ExpenseList
              expenses={filteredExpenses}
              onDelete={deleteExpense}
              onEdit={handleEditClick}
            />
            </div>
            
            <div style={{ position: "fixed", left: "-9999px", width: "800px", height: "400px" }}>
              <div ref={monthlyExpensesRef} style={{ width: "100%", height: "400px", backgroundColor: "white" }}>
                <Chart
                  chartType="monthly-expenses"
                  data={monthlyExpensesData(yearExpenses)}
                  availableCategories={availableCategories}
                  budgets={budgets}
                  categoryColors={categoryColors}
                  height={400}
                />
              </div>

              <div ref={monthlyCountRef} style={{ width: "100%", height: "400px", backgroundColor: "white" }}>
                <Chart
                  chartType="monthly-count"
                  data={monthlyCountData(yearExpenses)}
                  availableCategories={availableCategories}
                  budgets={budgets}
                  categoryColors={categoryColors}
                  height={400}
                />
              </div>

              <div ref={categoryMonthlyRef} style={{ width: "100%", height: "400px", backgroundColor: "white" }}>
                <Chart
                  chartType="category-monthly"
                  data={categoryMonthlyData(yearExpenses)}
                  availableCategories={availableCategories}
                  selectedCategory={[]}
                  budgets={budgets}
                  categoryColors={categoryColors}
                  height={400}
                />
              </div>

              <div ref={categoryTotalRef} style={{ width: "100%", height: "400px", backgroundColor: "white" }}>
                <Chart
                  chartType="category-total"
                  data={categoryTotalData(yearExpenses)}
                  availableCategories={availableCategories}
                  budgets={budgets}
                  categoryColors={categoryColors}
                  height={400}
                />
              </div>


            </div>
            <div className="buttons-row">
            <Button
              colour="green"
              text={formState ? "Close form" : "Add expense"}
              onClick={toggleForm}
              className={formState ? "btn-delete" : "btn-add"}
            />

            <Button className="btn-pdf" text="Download report as PDF" onClick={exportPDF} />
            <Button className="btn-csv" text="Download report as CSV" onClick={exportCSV} />
          </div>
          </div>
        </div>
        </div>
        </div>

      </>
  )
}

export default ExpenseTracker