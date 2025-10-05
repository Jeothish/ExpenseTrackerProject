import "../Styles/index.css"
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
  .sort((a,b) => new Date(b.date) - new Date(a.date))
  .slice(0,5)


  const getMonthlyExpenses = (month,year) => {
    return expenses.filter(exp => {
    const expDate = new Date(exp.date)
    return expDate.getMonth() === month && expDate.getFullYear() === year
  })
  .reduce((sum,exp) => sum + exp.amount,0)
}

  const thisMonthTotal = getMonthlyExpenses(currentMonth,currentYear)
  const lastMonthTotal = getMonthlyExpenses(lastMonth,lastMonthYear)
  const difference = Math.round(Math.abs((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100)
  const avgDailyMonth = thisMonthTotal / now.getDate()
  



  return (

    <div>
      <Header title="Dashboard" />
      <div className="summary-container">
      <div className="summary-card">
        <div className="summary-text">
        <h1>${thisMonthTotal}</h1>
        <p>Total Expenses This Month</p>
        <p style={{ display: "block", color: difference < 0 ? "#d61414ff" : "#14cb51ff"  }}>{difference < 0 ? `📈 Up +${difference}% less from last month` : `📉 Down -${difference}% more from last month`}</p>
        </div>
      </div>
      <div className="summary-card">
        <div className="summary-text">
          <h1>Average Daily Spending</h1>
          <p>${avgDailyMonth}</p>

        </div>
      </div>
    </div>
    <ExpenseList expenses={recentExpenses}/>
    </div>
    
  )
}

export default Dashboard