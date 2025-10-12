import React, { useMemo, useEffect, useState } from 'react';
import { useData } from '../Context/DataContext';

/**
 * React hook that prepares and filters expense data for different chart visualizations
 */

/**
 * 
 * @param {number} [initialYear=new Date().getFullYear()] - Default year for filtering expenses 
 * @returns {Object} Chart state , utility and  processeddata functions
 */
export const useChartData = (initialYear = new Date().getFullYear()) => {

  //State management
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState([]);

  //Get expenses and budgets to modify them from the context file
  const { expenses, budgets, availableYears, availableCategories, nextMonthTotal, nextMonthTotalByCategory } = useData()

  const chartTypes = [
    { value: "monthly-expenses", label: "Monthly Expense Amounts" },
    { value: "monthly-count", label: "Number of Expenses per Month" },
    { value: "category-monthly", label: "Category Breakdown by Month" },
    { value: "category-total", label: "Total by Category" }

  ];

  const forecastChartTypes = [
    { value: "monthly-total-forecast", label: "Monthly Expense Amount with Forecast" },
    { value: "category-monthly-total-forecast", label: "Monthly Expense Amount with Forecast Per Category" }
  ]

  const categoryColors = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12',
    '#9b59b6', '#1abc9c', '#e67e22', '#34495e'
  ];

  //Filter expenses by selected year
  const yearExpenses = useMemo(() => expenses.filter(expense => new Date(expense.date).getFullYear() === selectedYear), [expenses, selectedYear])

  /**
   * Toggles a category in the selectedCategory state
   * @param {string} category - The category name to toggle
   */

  const handleCategoryChange = (category) => {
    setSelectedCategory(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  }

  /**
   * Processes expenses into monthly totals
   * @param {Array<Object>} yearExpenses - Expenses filtered by selected year
   * @returns {Array<Object>} Monthly totals per month
   */

  const processMonthlyExpenses = (yearExpenses) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = monthNames.map(month => ({ month, total: 0 }));
    yearExpenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month].total += Number(exp.amount);
    });
    return monthlyTotals;
  }

  /**
   * Process expenses into monthly counts
   * @param {Array<Object>} yearExpenses - Expenses filtered by selected year
   * @returns {Array<Object>} Count of expenses per month
   */

  const processMonthlyCount = (yearExpenses) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyCounts = monthNames.map(month => ({ month, count: 0 }));
    yearExpenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      monthlyCounts[month].count += 1;
    });
    return monthlyCounts;
  }

  const processMonthlyExpensesWithForecast = (yearExpenses, nextMonthTotal = null) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals = monthNames.map(month => ({ month, total: 0, isForecast: false }));

    yearExpenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      monthlyTotals[month].total += Number(exp.amount);
    });

    if (nextMonthTotal != null) {
      const nextMonthIndex = (new Date().getMonth() + 1) % 12

      monthlyTotals[nextMonthIndex].total = nextMonthTotal
      monthlyTotals[nextMonthIndex].isForecast = true
    }
    return monthlyTotals;

  }

  const processCategoriesForecast = (yearExpenses, nextMonthTotalByCategory = []) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const filteredExpenses = selectedCategory.length > 0 ? yearExpenses.filter(exp => selectedCategory.includes(exp.category)) : yearExpenses;

    const monthlyData = monthNames.map(month => {
      const monthObj = { month };
      availableCategories.forEach(cat => monthObj[cat] = 0);
      return monthObj;
    });

    filteredExpenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      if (exp.category && monthlyData[month]) {
        monthlyData[month][exp.category] += Number(exp.amount);
      }
    });

    const nextMonthIndex = (new Date().getMonth() + 1) % 12;
    Object.entries(nextMonthTotalByCategory).forEach(([category, forecastValue]) => {
      if (monthlyData[nextMonthIndex][category] !== undefined) {
        monthlyData[nextMonthIndex][category] = Number(forecastValue)
      }
    })

    return monthlyData


  }




  /**
   * Process expenses into category totals per month
   * Filters by selected categories if any are selected
   * @param {Array<Object>} yearExpenses - Expenses filtered by selected year
   * @returns {Array<Object>} Category breakdown for each month
   */

  const processCategoryMonthly = (yearExpenses) => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const filteredExpenses = selectedCategory.length > 0 ? yearExpenses.filter(exp => selectedCategory.includes(exp.category)) : yearExpenses;

    const monthlyData = monthNames.map(month => {
      const monthObj = { month };
      availableCategories.forEach(cat => monthObj[cat] = 0);
      return monthObj;
    });

    filteredExpenses.forEach(exp => {
      const month = new Date(exp.date).getMonth();
      if (exp.category && monthlyData[month]) {
        monthlyData[month][exp.category] += Number(exp.amount);
      }
    });
    return monthlyData;
  }

  /**
   * Process expenses into total per category
   * @param {Array<Object>} yearExpenses - Expenses filtered by selected year
   * @returns {Array<Object>} Totals per category
   */

  const processCategoryTotal = (yearExpenses) => {
    const categoryTotals = availableCategories.map(cat => ({ category: cat, total: 0 }));
    yearExpenses.forEach(exp => {
      const obj = categoryTotals.find(item => item.category === exp.category);
      if (obj) obj.total += Number(exp.amount);
    });
    return categoryTotals.filter(item => item.total > 0);
  }

  /**
   * Get chart data based on chart type
   * @param {string} chartType - The type of chart to generate data for
   * @returns {Array<Object>} Processed chart data
   */

  const getChartData = (chartType) => {

    switch (chartType) {
      case "monthly-expenses":
        return processMonthlyExpenses(yearExpenses)

      case "category-monthly-total-forecast":
        return processCategoriesForecast(yearExpenses, nextMonthTotalByCategory)

      case "monthly-total-forecast":
        return processMonthlyExpensesWithForecast(yearExpenses, nextMonthTotal)

      case "monthly-count":
        return processMonthlyCount(yearExpenses)

      case "category-monthly":
        return processCategoryMonthly(yearExpenses)

      case "category-total":
        return processCategoryTotal(yearExpenses)



      default:
        return [];
    }
  }


  return {
    selectedYear,
    setSelectedYear,
    selectedCategory,
    setSelectedCategory,

    yearExpenses,
    availableYears,
    availableCategories,
    budgets,

    monthlyExpensesData: processMonthlyExpenses,
    monthlyCountData: processMonthlyCount,
    categoryMonthlyData: processCategoryMonthly,
    categoryTotalData: processCategoryTotal,
    monthlyExpensesForecastData: processMonthlyExpensesWithForecast,
    categoryMonthlyForecastData: processCategoriesForecast,


    chartTypes,
    forecastChartTypes,
    categoryColors,

    handleCategoryChange,
    getChartData,

  }
}



