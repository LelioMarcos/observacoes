from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from . import api_b3
from django.contrib.auth import authenticate 
from django.core.serializers import serialize

import json
from .models import Stock, StockHistory

from django.views.decorators.csrf import csrf_exempt

import os
from dotenv import load_dotenv

load_dotenv(".env")
dummy_password = os.getenv("DUMMY_PASSWORD")

# Create your views here.
def index(request):
    return HttpResponse("Hello, world. You're at the stocks index.")

@csrf_exempt
def create_stock(request):
    user = authenticate(username='lelio', password=dummy_password)

    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        symbol = body['symbol']
        upper_limit = body['upper_limit']
        lower_limit = body['lower_limit']

        price = api_b3.get_stock_price(symbol)
        print(price)

        Stock.objects.create(user=user, symbol=symbol, price=price, upper_limit=upper_limit, lower_limit=lower_limit)
        StockHistory.objects.create(stock=stock, price=price)


        return JsonResponse({'message': 'Stock created successfully!'})

def get_stocks(request):
    user = authenticate(username='lelio', password=dummy_password)

    if request.method == 'GET':
        stocks = Stock.objects.filter(user=user).values('symbol', 'price', 'upper_limit', 'lower_limit')
        return JsonResponse({'result': list(stocks)})

def get_stock(request, token):
    user = authenticate(username='lelio', password=dummy_password)

    stock = Stock.objects.filter(user=user, symbol=token).values('symbol', 'price', 'upper_limit', 'lower_limit')
    
    if not stock:
        return HttpResponse(status=404)

    return JsonResponse({'result': list(stock)[0]})


@csrf_exempt
def delete_stock(request, token):
    user = authenticate(username='lelio', password=dummy_password)

    if request.method == 'DELETE':
        stock = Stock.objects.get(user=user, symbol=token)
        stock.delete()

        return JsonResponse({'message': 'Deleted successfully!'}) 