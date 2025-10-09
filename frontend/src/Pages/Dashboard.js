import "../Styles/index.css"
import "../Styles/budget.css"
import Header from "../components/Header"
import { useState, useEffect, useRef } from 'react'
import { useData } from '../Context/DataContext'
import "../Styles/dashboard.css"
import ExpenseList from "../components/ExpenseList"
const Dashboard = () => {

  const { budgets, expenses, availableYears } = useData()

  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
  const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear

  const recentExpenses = [...expenses]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)


  const getMonthlyExpenses = (month, year) => {
    return expenses.filter(exp => {
      const expDate = new Date(exp.date)
      return expDate.getMonth() === month && expDate.getFullYear() === year
    })
      .reduce((sum, exp) => sum + exp.amount, 0)
  }

  const thisMonthTotal = getMonthlyExpenses(currentMonth, currentYear)
  const lastMonthTotal = getMonthlyExpenses(lastMonth, lastMonthYear)
  const difference = Math.round(Math.abs((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
  const avgDailyMonth = thisMonthTotal / now.getDate()

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

  const categoryTotal = budgets.reduce((totals, budget) => {
    const totalSpent = expenses.filter(expense => expense.category === budget.category).reduce((sum, expense) => sum + expense.amount, 0)
    totals[budget.category] = totalSpent
    return totals
  }, {})




  return (

    <>
      <div>
        <Header title="Dashboard" />
        <div className="summary-container">
          <div className="summary-card">
            <div className="summary-text">
              <h1>${thisMonthTotal}</h1>
              <p>Total Expenses This Month</p>
              <p style={{ display: "block", color: difference < 0 ? "#d61414ff" : "#14cb51ff" }}>{difference < 0 ? `📈 Up +${difference}% less from last month` : `📉 Down -${difference}% more from last month`}</p>
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-text">
              <h1>Average Daily Spending</h1>
              <p>${avgDailyMonth}</p>

            </div>
          </div>
        </div>
      </div>
      <div className="recent-list">
        {recentExpenses.length > 0 ? (
          recentExpenses.map(expense => (
            <div key={expense.id} className="expense-item">
              <div className="expense-icon">
                {getCategoryIcon(expense.category)}
              </div>
              <div className="expense-details">
                <div className="expense-name">{expense.name}</div>
                <div className="expense-meta">
                  {expense.category} • {new Date(expense.date).toLocaleDateString()}
                </div>
              </div>
              <div>€{expense.amount.toFixed(2)}</div>
            </div>
          ))
        ) : (
          <div className="empty-state">No expenses yet</div>
        )}
      </div>

      <div className="budget-list">
        {budgets.length > 0 ? (
          budgets.map(budget => {
            const spent = categoryTotal[budget.category] || 0
            const percentage = Math.min((spent / budget.categoryLimit) * 100, 100)
            const remaining = budget.categoryLimit - spent

            let progressIndicator = "progress-safe"
            if (percentage >= 85) progressIndicator = "progress-danger"
            else if (percentage >= 60) progressIndicator = "progress-warning"

            return (
              <div key={budget.id} className="budget-list-item">
                <div className="budegt-list-info">
                  <span className="budget-category">
                    {getCategoryIcon(budget.category)} {budget.category}
                  </span>
                  <span className="budget-amount">
                    {spent.toFixed(2)} / {budget.categoryLimit.toFixed(2)}
                  </span>
                </div>

                <div className='progress-bar'>
                  <div className={`progress-fill ${progressIndicator}`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}>
                  </div>
                </div>
                <span className="status-percentage">{Math.round(percentage)}%</span>
              </div>
            )
          })
        ) : (
          <div>No budgets set</div>
        
        )}
      </div>
    </>
  )
}

export default Dashboard