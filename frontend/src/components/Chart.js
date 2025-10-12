

import React from "react";
import { BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, YAxis, XAxis, Bar, ReferenceLine, LineChart , Line} from 'recharts';

/**
 *  Renders 4 types of expense-related bar charts
 */

/**
 * 
 * @param {Object} props
 * @param {string} props.chartType - Determines the type of chart
 * @param {Array<Object>} props.data - Data to be displayed in the chart
 * @param {Array<string>} props.availableCategories - All possible categories
 * @param {Array<string>} props.selectedCategory - Categories to display
 * @param {Array<Object>} props.budgets - Budget objects for reference lines
 * @param {Array<string>} props.categoryColors - Colors for each category bar
 * @param {number} props.height - Height of the chart
 * 
 * @returns {JSX.Element} A responsive bar chart or a message if no data is available
 */
const Chart = ({
  chartType,
  data,
  availableCategories,
  selectedCategory = [],
  budgets,
  categoryColors,
  height = 750
}) => {

  if (!data || data.length === 0) {
    return <div>No data available for this criteria</div>
  }

  /**
   * 
   * @returns {JSX.Element|null}
   */

  const renderChart = () => {

    switch (chartType) {
      case "monthly-expenses":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 30 }} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5, dy: 15, style: { fontWeight: "bold" } }} />
              <YAxis label={{ value: "Amount (€)", position: "insideLeft", offset: -10, angle: -90, dy: 30, style: { fontWeight: "bold" } }} />
              <Tooltip formatter={value => [`£${value.toFixed(2)}`, "Amount"]} />
              <Bar dataKey="total" fill="#8884d8" name="Monthly Expenses" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "monthly-total-forecast":
        const allTotals = data.map(d=>d.total)
        const maxDataValueTotal = Math.max(...allTotals,0)
        
        return (

          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5, dy: 15, style: { fontWeight: "bold" } }} />
              <YAxis domain={[0, maxDataValueTotal]} label={{ value: "Amount (€)", position: "insideLeft", offset: -10, angle: -90, dy: 30, style: { fontWeight: "bold" } }} />
              <Tooltip formatter={value => [`£${value.toFixed(2)}`, "Amount"]} />
              <Line type="monotone" dataKey="total" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>

        );

      case "monthly-count":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 30 }} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5, dy: 15, style: { fontWeight: "bold" } }} />
              <YAxis label={{ value: "Number", position: "insideLeft", offset: -10, angle: -90, dy: 30, style: { fontWeight: "bold" } }} />
              <Tooltip />

              <Bar dataKey="count" fill="#8884d8" name="Number of expenses" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "category-monthly":

        // Find the max value for Y-axis to include both data and budget reference lines

        const allBudgetValues = budgets.map(b => Number(b.categoryLimit));
        const maxDataValue = Math.max(...data.flatMap(d => Object.values(d).slice(1)), ...allBudgetValues, 0);

        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 150, left: 50, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5, dy: 15, style: { fontWeight: "bold" } }} />
              <YAxis domain={[0, maxDataValue]} label={{ value: "Amount (€)", position: "insideLeft", offset: -10, angle: -90, dy: 30, style: { fontWeight: "bold" } }} />
              <Tooltip formatter={(value, name) => [`£${value.toFixed(2)}`, name]} />
              <Legend verticalAlign="top" />

              {availableCategories.map((category, index) => {
                const shouldShow = selectedCategory.length === 0 || selectedCategory.includes(category);
                if (!shouldShow) return null;


                const color = categoryColors[index % categoryColors.length];

                return (
                  <React.Fragment key={category}>
                    <Bar dataKey={category} stackId="a" fill={color} name={category} />

                  </React.Fragment>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        );

      case "category-monthly-total-forecast":
        const allValues = data.flatMap(d => Object.values(d).slice(1))
        const maxDataValueTotalCategory = Math.max(...allValues,0)
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" label={{ value: "Month", position: "insideBottom", offset: -5, dy: 15, style: { fontWeight: "bold" } }} />
              <YAxis domain={[0, maxDataValueTotalCategory]} label={{ value: "Amount (€)", position: "insideLeft", offset: -10, angle: -90, dy: 30, style: { fontWeight: "bold" } }} />
              <Tooltip formatter={(value, name) => [`£${value.toFixed(2)}`, name]} />
              <Legend verticalAlign="top" />

              {availableCategories.map((category, index) => {
                const shouldShow = selectedCategory.length === 0 || selectedCategory.includes(category);
                if (!shouldShow) return null;


                const color = categoryColors[index % categoryColors.length];

                return (
                  <React.Fragment key={category}>
                    <Line type="monotone" dataKey={category} stroke={color} />

                  </React.Fragment>
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        );


      case "category-total":


        return (

          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 30 }} >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" label={{ value: "Category", position: "insideBottom", offset: -5, dy: 15, style: { fontWeight: "bold" } }} />
              <YAxis label={{ value: "Amount (€)", position: "insideLeft", offset: -10, angle: -90, dy: 30, style: { fontWeight: "bold" } }} />
              <Tooltip formatter={value => [`£${value.toFixed(2)}`, "Total Amount"]} />

              <Bar dataKey="total" fill="#8884d8" name="Total by Category" />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  }
  return renderChart()
}
export default Chart;