import psycopg2
import pandas as pd

database_connection = psycopg2.connect(
    dbname="${DB_NAME}",
    user="${DB_USER}",
    password="REMOVED_SECRET",
    host="localhost",
    port="5432",
)

query = """

SELECT date, amount, category
FROM expense_entity
ORDER BY date;

"""

data = pd.read_sql(query,database_connection)
database_connection.close()

insights = []

#Used to compare weekend vs weekday spending

data["date"] = pd.to_datetime(data["date"], utc=True).dt.tz_convert(None)
data["weekday"] = data["date"].dt.weekday

weekend_spend = data[data["weekday"] >= 5]["amount"].sum()
weekday_spend = data[data["weekday"] < 5]["amount"].sum()

weekday_avg = data[data["weekday"] <5 ]["amount"].mean() if weekday_spend > 0 else 0
suggested_weekend_limit = weekday_avg * 2

if weekday_spend > 0:
    percentage_increase = abs(((weekend_spend - weekday_spend) / weekday_spend) * 100)
    insights.append(f"Weekend spending is {percentage_increase:.2f}% {'higher' if percentage_increase > 0 else 'lower'} than weekday spending."
                    f"Consider setting a weekend spending limit of €{suggested_weekend_limit:.2f} to better control your budget ")
else:
    insights.append("No weekday spending data available for comparison.")
    

#Used to compare this month vs last month spending

data["month"] = data["date"].dt.to_period("M")
monthly_spend = data.groupby("month")["amount"].sum().sort_index()

if len(monthly_spend) >= 2:
    last_month_spending = monthly_spend.iloc[-2]
    this_month_spending = monthly_spend.iloc[-1]
    month_spending_increase = abs((this_month_spending - last_month_spending) / last_month_spending * 100)
    insights.append(f"This months spending is {month_spending_increase:.2f}% {'higher' if month_spending_increase > 0 else 'lower'} than last month")
    
else:
    insights.append("Not enough data to compare monthly spending")  
    
#Used to find the top spending category  

category_spend = data.groupby("category")["amount"].sum().sort_values(ascending=False)

top_category = category_spend.index[0]
top_amount = category_spend.iloc[0]

total = data["amount"].sum()


if(top_amount) > 0:
    category_percentage = (top_amount / total) * 100
    insights.append(f"Your top spending category is {top_category} making up {category_percentage:.2f}% of total spending." 
          f"{'Consider taking a close look at your spending for ' + top_category if category_percentage > 40 else''}")
    
    
 
for insight in insights:
    print("---- "+insight+" ----")   
          
    
    
    
    
    
    
    
    



