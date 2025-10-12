
import Header from "../components/Header"
import "../Styles/index.css"
import "../Styles/ai.css"
import "../Styles/Charts.css";
import Chart from '../components/Chart';
import { useChartData } from '../Hooks/useChartData';
import { useState, useEffect, } from 'react'
import { useData } from '../Context/DataContext'





const AI = () => {
  const { insights } = useData()
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

          <div className="chart-section">
            <label htmlFor='chart-type'>Chart Type:</label>
            <select id="chart-type" value={forcastChartType} onChange={(e) => setForecastChartType(e.target.value)}>
              {forecastChartTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>

            {forcastChartType === "category-monthly-total-forecast" && (
                <div>
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



                <div>
                  <h2>{forecastChartTypes.find(type => type.value === forcastChartType)?.label}</h2>
                  <Chart
                    chartType={forcastChartType}
                    data={currentChartData}
                    availableCategories={availableCategories}
                    selectedCategory={selectedCategory}
                    categoryColors={categoryColors}
                    height={750} />

                </div>
        
            
          </div>
        </div>
      </div>

    </>
  )
}

export default AI
