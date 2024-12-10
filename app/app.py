from flask import Flask, jsonify, send_from_directory
import pandas as pd

app = Flask(__name__)

@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

@app.route('/api/data')
def get_data():
    import pandas as pd
    data = pd.read_csv('cleaned_fec_data.csv', header=0)
    data = data.fillna("")
    print(data.to_dict(orient='records'))
    return jsonify(data.to_dict(orient='records'))

@app.route('/static/yearly_contributions')
def serve_yearly_contributions():
    return send_from_directory('static', 'yearly-contributions.png')

if __name__ == '__main__':
    app.run(debug=True)