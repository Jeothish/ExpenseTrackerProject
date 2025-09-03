/**
 * Provides controls for selecting chart type, year, and categories
 * Integrates with "useChartData" to fetch and process epxenses into different chart formats
 * Renders the chart componenet with the processed data
 */

import React, { useMemo, useEffect, useState } from 'react';
import Header from '../components/Header';
import Chart from '../components/Chart';
import "../Styles/Charts.css";
import { useChartData } from '../Hooks/useChartData';


const Analysis = () => {

  //State management
  const [chartType, setChartType] = useState("monthly-expenses");

  //Hook provoides all data and utilities for chart rendering

  const {
    selectedYear,
    setSelectedYear,
    selectedCategory,
    handleCategoryChange,
    availableYears,
    availableCategories,
    budgets,
    chartTypes,
    categoryColors,
    getChartData
  } = useChartData()


  //Current chart data
  const currentChartData = getChartData(chartType)


  return (
    <>
      {/*Header*/}
      <Header title="Analysis" />
      
      <div className='chart-controls'>

        {/*Chart Controls*/}
        <div>

          {/*Select chart type*/}

          <label htmlFor='chart-type'>Chart Type:</label>
          <select id="chart-type" value={chartType} onChange={(e) => setChartType(e.target.value)}>
            {chartTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>


          {/*Select year*/}

          <label htmlFor="year-select">Year:</label>
          <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
            {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
          </select>


          {chartType === "category-monthly" && (
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
        </div>
        {/*Chart Display*/}
        <div>
          <h2>{chartTypes.find(type => type.value === chartType)?.label} - {selectedYear}</h2>

          <Chart
            chartType={chartType}
            data={currentChartData}
            availableCategories={availableCategories}
            selectedCategory={selectedCategory}
            budgets={budgets}
            categoryColors={categoryColors}
            height={750} />

        </div>
      </div>
    </>
  );
}

export default Analysis;  