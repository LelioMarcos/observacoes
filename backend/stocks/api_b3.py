import requests
import os
from dotenv import load_dotenv

load_dotenv(".env")

api_key = os.getenv("API_KEY")

def get_stock(symbol):
    resp = requests.get(f'https://brapi.dev/api/quote/{symbol}?token={api_key}')
    if resp.status_code != 200:
        return None
    return resp.json().get('results')[0]

def get_stock_price(symbol):
    stock = get_stock(symbol)

    if stock is None:
        return None

    return stock.get('regularMarketPrice')