from flask import render_template, request, Flask, jsonify
import yfinance as yf
app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_stock_data', methods=['POST'])
def get_stock_data():
    ticker = request.get_json()['ticker']
    data = yf.Ticker(ticker).history(period='1y')
    latest_data = data.iloc[-1]
    return jsonify({'currentPrice': latest_data.Close,
                    'openPrice': latest_data.Open})

if __name__ == '__main__':
    app.run(debug=True)
