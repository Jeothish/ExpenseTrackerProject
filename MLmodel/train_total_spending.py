"""
train_total_spending.py

This script connects to the 'expense_tracker_db PostgreSQL database to get expense spending data per month and forecasts the next months spending using Prophet 

"""



import psycopg2
import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet

print("Script is running!")

#Connects to PostgreSQL database
database_connection = psycopg2.connect(
    dbname="your_details",
    user="your_details",
    password="your_details",
    host="your_details",
    port="your_details",
)


#Gets total spending per month
query="""

SELECT DATE_TRUNC('month', date) AS month,
        SUM(amount) AS total_spending
FROM expense_entity
GROUP BY month
ORDER BY month;        
"""


#Executes the SQL command and closes the database connection
data = pd.read_sql(query,database_connection)
database_connection.close()


#Converts the month column to a datetime object without a timezone
data['month'] = pd.to_datetime(data['month'], utc=True).dt.tz_convert(None)

#Ensures data is sorted chronologically and the index is resetted
data = data.sort_values('month').reset_index(drop=True)

print()
print("Raw data:")
print(data)


#Renaming columns to 'ds' (date) and 'y' (target value) as required by Prophet
df_prophet = data.rename(columns={'month':'ds','total_spending':'y'})


#Initialize Prophet model
model = Prophet(yearly_seasonality=True, weekly_seasonality=False , daily_seasonality=False)

#Fits the model to the historical data
model.fit(df_prophet)

#Create a future dataframe which extends 1 month past the last data point
future = model.make_future_dataframe(periods=1, freq='M')
forecast = model.predict(future)


plt.figure(figsize=(10,5))
plt.plot(df_prophet['ds'],df_prophet['y'],marker='o', markersize=10,linewidth=4,label="Actual Spending")
plt.plot(forecast['ds'],forecast['yhat'],linestyle='--',color='red',label="Forecast")

# Highlights next month's prediction
next_month_date = forecast['ds'].iloc[-1]
next_month_value = forecast['yhat'].iloc[-1]

plt.scatter(next_month_date,next_month_value,color='green',s=100,label="Next Month Prediction")
plt.annotate(f"€{next_month_value:.2f}",(next_month_date,next_month_value),textcoords="offset points",xytext=(0,10), ha='center',color='green')

plt.title("Total Monthly Spending Prediction")
plt.xlabel("Month")
plt.ylabel("Spending (€)")
plt.legend()
plt.grid(True)
plt.show()







