from flask import Flask, jsonify, send_from_directory
import pandas as pd

app = Flask(__name__, static_folder='static')

# API endpoint to serve data
@app.route('/api/data')
def get_data():
    df = pd.read_csv('data/campaign_donations.csv')
    return jsonify(df.to_dict(orient='records'))

# Serve the HTML page
@app.route('/')
def serve_page():
    return send_from_directory('static', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)