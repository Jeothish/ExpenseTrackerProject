
from flask import Flask,jsonify
import psycopg2
import pandas as pd
import os
app = Flask(__name__)


def get_db_connection():
    return psycopg2.connect(
        os.environ.get('DATABASE_URL')
    )
    
    
database_connection = get_db_connection()

query = """

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
database_connection.close()

total_goal = data["category_limit"].sum()
total_spent = data["amount"].sum()

total_progress=abs((total_spent/total_goal) * 100) if total_goal > 0 else 0

print(f"You are {total_progress:.2f}% towards your savings goal this month!")

