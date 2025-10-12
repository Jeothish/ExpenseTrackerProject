from flask import Flask,jsonify
from flask_cors import CORS
import psycopg2
import pandas as pd
from spending_insights import get_insights
from train_total_spending import predict_total_spending
from train_spending_per_category import predict_spending_per_category

app = Flask(__name__)
CORS(app)


def get_db_connection():
    return psycopg2.connect(
    dbname="${DB_NAME}",
    user="${DB_USER}",
    password="REMOVED_SECRET",
    host="localhost",
    port="5432",
    )

@app.route("/insights",methods=['GET'])
def insights_route():
    return jsonify(get_insights())

@app.route("/spending/total")
def total_spending_route():
    return jsonify({"next_month_prediction" : predict_total_spending()})
    
    
@app.route("/spending/categories")
def category_spending_route():
    return jsonify(predict_spending_per_category())


if __name__ == "__main__":
    app.run(debug=True, port=5000)
    