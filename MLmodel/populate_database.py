


"""
populate_database.py

This script populates the 'expense_entity' table in the 'expense_tracer_db' PostqreSQL database with randomly generated fake expense data for testing and analysis

"""

import psycopg2
import pandas as pd
import random
from datetime import datetime,timedelta

print("Script is running!")

#Connects to PostgreSQL database
database_connection = psycopg2.connect(
    dbname="${DB_NAME}",
    user="${DB_USER}",
    password="REMOVED_SECRET",
    host="localhost",
    port="5432",
)

#Creates a cursor object that points to the database and allows SQL commands to be executed
cursor = database_connection.cursor()

categories = ["Housing", "Food", "Transportation", "Entertainment", "Healthcare", "Other"]

#Populate expenses with random values
for i in range(150):
    name = f"Fake Expense {i+1}"
    amount = random.randint(10,500)
    category = random.choice(categories)
    date = datetime.now() - timedelta(days=random.randint(0,365))
    recurrence_type = "NONE"
    recurrence_interval = 0
    
    #Adds a new row to the table 
    cursor.execute("""
                   INSERT INTO expense_entity (name, amount, category , date , recurrence_type, recurrence_interval)
                   VALUES (%s, %s, %s,%s ,%s ,%s)
                   """,(name, amount, category, date, recurrence_type, recurrence_interval))    
    
#Saves changes and closes all connections    
database_connection.commit()
cursor.close()
database_connection.close()
print("Database Populated")








