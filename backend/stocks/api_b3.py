import requests
import os
from dotenv import load_dotenv

load_dotenv(".env")

api_key = os.getenv("API_KEY")

def get_stock(symbol):
    resp = requests.get(f'https://brapi.dev/api/quote/{symbol}?token={api_key}')
    return resp.json().get('results')[0]

def get_stock_price(symbol):
    return get_stock(symbol).get('regularMarketPrice')