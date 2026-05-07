import psycopg2
import pandas as pd
import os

def get_db_connection():
    return psycopg2.connect(
        os.environ.get('DATABASE_URL')
    )
    
    
def get_insights():
    database_connection = get_db_connection()
    
    query = """

    SELECT date, amount, category
    FROM expense_entity
    ORDER BY date;

"""

    goal_query = """

    SELECT budget_entity.id ,
       budget_entity.category AS budget_category,
       budget_entity.category_limit,
       expense_entity.id AS expense_id,
       expense_entity.amount,
       expense_entity.category AS expense_category,
       expense_entity.name,
       expense_entity.description,
       expense_entity.date

        FROM budget_entity
        LEFT JOIN expense_entity
        ON expense_entity.budget_id = budget_entity.id   
        ORDER BY expense_entity.date;   
      
        """

    data = pd.read_sql(query,database_connection)
    goal_data = pd.read_sql(goal_query,database_connection)
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
        insights.append({
            "header" : "💡 Smart Insights",
            "message" : f"Based on your spending patterns, I've noticed that your weekend spending is {percentage_increase:.2f}% {'higher' if percentage_increase > 0 else 'lower'} than weekday spending."
                        f"\n Consider setting a weekend spending limit of €{suggested_weekend_limit:.2f} to better control your budget "
                        })
    else:
        insights.append("No weekday spending data available for comparison.")
        

    #Used to compare this month vs last month spending

    data["month"] = data["date"].dt.to_period("M")
    monthly_spend = data.groupby("month")["amount"].sum().sort_index()

    if len(monthly_spend) >= 2:
        last_month_spending = monthly_spend.iloc[-2]
        this_month_spending = monthly_spend.iloc[-1]
        month_spending_increase = abs((this_month_spending - last_month_spending) / last_month_spending * 100)
        insights.append({"header" : "⚖️ Comparative Insights",
                         "message" :   f"This months spending is {month_spending_increase:.2f}% {'higher' if month_spending_increase > 0 else 'lower'} than last month"
                         })
        
    else:
        insights.append("Not enough data to compare monthly spending")  
        
    #Used to find the top spending category  

    category_spend = data.groupby("category")["amount"].sum().sort_values(ascending=False)

    top_category = category_spend.index[0]
    top_amount = category_spend.iloc[0]

    total = data["amount"].sum()


    if(top_amount) > 0:
        category_percentage = (top_amount / total) * 100
        insights.append({
            "header": "Top spending category",
            "message" : f"Your top spending category is {top_category} making up {category_percentage:.2f}% of total spending." 
                        f"{'Consider taking a close look at your spending for ' + top_category if category_percentage > 40 else''}"
        })
        
        
    #Used to track your goals
    
    total_goal = goal_data["category_limit"].sum()
    total_spent = goal_data["amount"].sum()

    total_progress=abs((total_spent/total_goal) * 100) if total_goal > 0 else 0  
    insights.append({
            "header": "🎯 Goal Tracking",
            "message" : f"You are {total_progress:.2f}% towards your savings goal this month!"
        })
      
        
    return insights    



        
    
    
        
        


    
    
 
          
    
    
    
    
    
    
    
    



