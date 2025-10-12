/**
 * Displays a list of budgets and allows the user to add,edit or delete budgets 
 * Connect with DataContext to update the global state
 */


import "../Styles/index.css"
import "../Styles/button.css"
import "../Styles/FinancialManagement.css"
import Header from '../components/Header'
import { useState, useEffect, useRef } from 'react'
import Button from '../components/Button'
import ExpenseList from "../components/ExpenseList"
import Form from '../components/Form'
import Swal from 'sweetalert2'
import BudgetForm from '../components/BudgetForm'
import { useData } from '../Context/DataContext'
import { useChartData } from '../Hooks/useChartData'
import BudgetList from '../components/BudgetList'
import autoTable from 'jspdf-autotable'
import html2canvas from 'html2canvas'
import Chart from '../components/Chart'
import jsPDF from 'jspdf'

const FinancialManagement = () => {

    //Get budgets and functions to modify them from the context file
    const { budgets, expenses, addExpense, updateExpense, deleteExpense, addBudget, updateBudget, deleteBudget, availableYears } = useData()



    //State management
    const [month, setMonth] = useState("")
    const [year, setYear] = useState(new Date().getFullYear())
    const [editingBudget, setEditingBudget] = useState(null)
    const [formState, setFormState] = useState(false)
    const [ExpenseFormState, setExpenseFormState] = useState(false)
    const [editingExpense, setEditingExpense] = useState(null)
    const [category, setCategory] = useState("");

    //Refs for capturing chart elements
    const monthlyExpensesRef = useRef(null)
    const monthlyCountRef = useRef(null)
    const categoryMonthlyRef = useRef(null)
    const categoryTotalRef = useRef(null)


    const categories = ["Housing", "Food", "Transportation", "Entertainment", "Healthcare", "Other"]

    const {
        availableCategories,
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

    //Toggle to display the form on/off
    const toggleForm = () => {
        setFormState(!formState)
        if (!formState) {
            setEditingBudget(null)
        }
    }

    const toggleExpenseForm = () => {
        setExpenseFormState(!ExpenseFormState)
        if (!ExpenseFormState) {
            setEditingExpense(null)
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

    const handleEditClickBudget = (expense) => {
        setEditingBudget(expense)
        setFormState(true)
    }

    /**
   * Adds a new epxense by calling the context function
   * @param {Object} newExpense - the new expense object to add
   */

    const handleAddExpense = (newExpense) => {
        addExpense(newExpense)
        setExpenseFormState(false)
    }

    /**
     * Edits an existing epxense by calling the context function
     * @param {Object} updatedExpense - the updated expense object to add
     */

    const handleEditExpense = (updatedExpense) => {
        updateExpense(updatedExpense)
        setEditingExpense(null)
        setExpenseFormState(false)
    }

    /**
     * Handles the click even for the Edit button
     * @param {Object} expense - The expense object to edit
     */

    const handleEditClickExpense = (expense) => {
        setEditingExpense(expense)
        setExpenseFormState(true)
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
    const availableBudgetCategories = categories.filter(c => !usedCategories.includes(c))

    const filteredExpenses = expenses.filter(exp => {
        const date = new Date(exp.date)
        const matchesMonth = month !== "" ? date.getMonth() === month : true
        const matchesYear = date.getFullYear() === year
        const matchesCategory = category !== "" ? exp.category === category : true
        return matchesMonth && matchesYear && matchesCategory
    })

    const availableMonths = Array.from(new Set(expenses.filter(exp => new Date(exp.date).getFullYear() === year)
        .map(exp => new Date(exp.date).getMonth())))

    //Total expense amount for filtered expenses
    const expenseTotal = filteredExpenses.reduce((sum, exp) => {
        return sum + exp.amount;
    }, 0)


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

            <Header title="Financial Management" />

            <div className="form-and-list-container">

                {formState && (
                    <BudgetForm onBudgetAdded={handleAddBudget} onBudgetEdited={handleEditBudget} editingBudget={editingBudget} existingCategories={availableBudgetCategories} />
                )}
                <div className="budget-section">
                    <div className="budget-header">
                        <h2>🎯Budget Tracking</h2>
                        <Button
                            text={formState ? "Close form" : "+ Add budget"}
                            onClick={toggleForm}
                            className={formState ? "btn-delete" : "btn-add"}
                        />


                    </div>
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
                                            <Button className='btn-icon btn-edit' onClick={() => handleEditClickBudget(budget)} text="✏️" />
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

                    </div>
                </div >
            </div>


            <div className="expenses-section">
                <div className="expenses-header">
                    <h2 className="section-title"> 💳Expense Tracking</h2>
                    <Button
                        text={ExpenseFormState ? "Close form" : "+ Add Expense"}
                        onClick={toggleExpenseForm}
                        className={ExpenseFormState ? "btn-delete" : "btn-add"}
                    />
                </div>


                <div className="expense-filters">
                    <div className="filter-group">
                        <label className="filter-label">Year</label>
                        <select className="filter-input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Month</label>
                        <select className="filter-input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                            <option value="">All</option>
                            {availableMonths.map(m => (
                                <option key={m} value={m}>{new Date(0, m).toLocaleString("default", { month: "long" })}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Category</label>
                        <select className="filter-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">All</option>
                            {availableCategories.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-group">
                        <label className="filter-label">Total</label>
                        <div className="expense-total-display">€{expenseTotal.toFixed(2)}</div>
                    </div>
                </div>


                <div className="export-buttons">
                    <Button className="btn-pdf" text="📊 Export PDF" onClick={exportPDF} />
                    <Button className="btn-csv" text="📋 Export CSV" onClick={exportCSV} />
                </div>


                <div className="expense-content">
                    {ExpenseFormState && (
                        <div className="expense-form-wrapper">
                            <Form
                                onExpenseAdded={handleAddExpense}
                                onExpenseEdited={handleEditExpense}
                                editingExpense={editingExpense}
                            />
                        </div>
                    )}

                    <div className="expenses-table-wrapper">
                        <ExpenseList
                            expenses={filteredExpenses}
                            onDelete={deleteExpense}
                            onEdit={handleEditClickExpense}
                            showActions={true}
                            showTotal={true}
                        />
                    </div>
                </div>
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
        </>
    )
}

export default FinancialManagement