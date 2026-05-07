
import Header from "../components/Header"
import "../Styles/index.css"
import "../Styles/ai.css"
import "../Styles/Charts.css";
import "../Styles/FinancialManagement.css"
import Chart from '../components/Chart';
import { useChartData } from '../Hooks/useChartData';
import { useState, useEffect, } from 'react'
import { useData } from '../Context/DataContext'





const AI = () => {
  const { insights, budgets, expenses } = useData()
  const [forcastChartType, setForecastChartType] = useState("monthly-total-forecast");

  const {
    getChartData,
    availableCategories,
    selectedCategory,
    handleCategoryChange,
    categoryColors,
    forecastChartTypes
  } = useChartData()

  const currentChartData = getChartData(forcastChartType)

  const expenseTotal = expenses.reduce((sum, exp) => {
    return sum + exp.amount;
  }, 0)

  const budgetTotal = budgets.reduce((sum, bud) => {
    return sum + bud.categoryLimit;
  }, 0)

  const budgetEfficiency = Math.min((budgetTotal / expenseTotal) * 100, 100)

  let progressIndicator = "progress-safe"
  if (budgetEfficiency >= 85) progressIndicator = "progress-danger"
  else if (budgetEfficiency >= 60) progressIndicator = "progress-warning"








  return (
    <>
      <Header title="AI Insights" />
      <div className="insight-container">
        <div className="insight-section">
          <div className="title-header"><h1>🤖 AI Financial Advisor</h1></div>
          {insights.map(insight => (
            <>
              <div className="insight-card">
                <div className="insight-header"><h2>{insight.header}</h2></div>
                <p style={{ whiteSpace: "pre-line" }}>{insight.message}</p>
              </div>
            </>
          ))}
        </div>

        <div className="trend-section">


          <div className="title-header"><h1>📈 Trend Analysis</h1></div>



          <label htmlFor='chart-type'>Chart Type:</label>
          <select id="chart-type" value={forcastChartType} onChange={(e) => setForecastChartType(e.target.value)}>
            {forecastChartTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>

          {forcastChartType === "category-monthly-total-forecast" && (
            <div className="chart-controls">
              <label>Categories (select multiple):</label>
              <div>
                {availableCategories.map(category => (
                  <label key={category} className='checkbox-label'>
                    <input type="checkbox" checked={selectedCategory.includes(category)} onChange={() => handleCategoryChange(category)} />
                    {category}
                  </label>

                ))}

              </div>
            </div>

          )}



          <div className="chart-section">
            <h2>{forecastChartTypes.find(type => type.value === forcastChartType)?.label}</h2>
            <Chart
              chartType={forcastChartType}
              data={currentChartData}
              availableCategories={availableCategories}
              selectedCategory={selectedCategory}
              categoryColors={categoryColors}
              height={400} />

          </div>


          <div className="title-header"><h2>📈 Statistical Analysis</h2></div>

          <div className="statistic-card">
            <div className="statistic-card-header">Budget Efficiency</div>

            <div className='progress-bar'>
              <div className={`progress-fill ${progressIndicator}`}
                style={{ width: `${Math.min(budgetEfficiency, 100)}%` }}>
              </div>
            </div>
            <span className="status-percentage">{Math.round(budgetEfficiency)}%</span>

          </div>
        </div>
      </div>

    </>
  )
}

export default AI
