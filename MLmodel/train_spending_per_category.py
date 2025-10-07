"""
train_spending_per_category.py

This script connects to the 'expense_tracker_db PostgreSQL database to get expense spending data per month per category and forecasts the next months spending for all categorys using Prophet 

"""

import psycopg2
import pandas as pd
import matplotlib.pyplot as plt
from prophet import Prophet
import math
from tqdm import tqdm

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
        category,
        SUM(amount) AS total_spending
FROM expense_entity
GROUP BY month, category
ORDER BY month, category;        
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



categories = data['category'].unique()
n_categories = len(categories)
n_cols = 2
n_rows = math.ceil(n_categories/ n_cols)
fig, axes = plt.subplots(n_rows,n_cols,figsize=(12,4*n_rows))

axes = axes.flatten()
fig.subplots_adjust(hspace=5)


for ax,category in zip(axes,tqdm(categories,desc="Training model for spending pattern prediction per category")):
    df_category = data[data['category'] == category][['month','total_spending']]
    df_category = df_category.rename(columns={'month':'ds','total_spending':'y'})
    
    #Initialize Prophet model
    model = Prophet(yearly_seasonality=True, weekly_seasonality=False , daily_seasonality=False)

    #Fits the model to the historical data
    model.fit(df_category)
    
    #Create a future dataframe which extends 1 month past the last data point
    future = model.make_future_dataframe(periods=1, freq='M')
    forecast = model.predict(future)
    
   
    ax.plot(df_category['ds'],df_category['y'],marker='o', markersize=10,linewidth=4,label="Actual Spending")
    ax.plot(forecast['ds'],forecast['yhat'],linestyle='--',color='red',label="Forecast")

    # Highlights next month's prediction
    next_month_date = forecast['ds'].iloc[-1]
    next_month_value = forecast['yhat'].iloc[-1]

    ax.scatter(next_month_date,next_month_value,color='green',s=100,label="Next Month Prediction")
    ax.annotate(f"€{next_month_value:.2f}",(next_month_date,next_month_value),textcoords="offset points",xytext=(0,10), ha='center',color='green')
    
    #y_max = max(df_category['y'].max(),forecast['yhat'].max())
    #ax.set_ylim(0,y_max * 1.1)

    ax.set_title(f"Total Monthly Spending Prediction for {category}")
    ax.set(xlabel="Month", ylabel="Spending (€)")
    ax.legend()
    ax.grid(True)
    


plt.tight_layout()
plt.show()
