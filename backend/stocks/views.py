from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from . import api_b3
from django.core.serializers import serialize
import json
from .models import Stock, StockHistory
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
import os
from dotenv import load_dotenv
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
import jwt

load_dotenv(".env")
dummy_password = os.getenv("DUMMY_PASSWORD")
jwt_secret = os.getenv("JWT_SECRET")

# Create your views here.
def index(request):
    return HttpResponse("Hello, world. You're at the stocks index.")

def __auth_token(request):
    token = request.headers['Authorization']

    if not token:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    token = token.split(' ')[1]

    try:
        user = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return user
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

@csrf_exempt
def create_stock(request):
    username = __auth_token(request)['username']
    user = User.objects.get(username=username)

    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        symbol = body['symbol']
        upper_limit = body['upper_limit']
        lower_limit = body['lower_limit']

        price = api_b3.get_stock_price(symbol)
        print(price)

        stock = Stock.objects.create(user=user, symbol=symbol, price=price, upper_limit=upper_limit, lower_limit=lower_limit)
        StockHistory.objects.create(stock=stock, price=price)

        return JsonResponse({'message': 'Stock created successfully!'})

def get_stocks(request):
    username = __auth_token(request)['username']
    user = User.objects.get(username=username)
    
    if request.method == 'GET':
        stocks = Stock.objects.filter(user=user).values('symbol', 'price', 'upper_limit', 'lower_limit')
        return JsonResponse({'result': list(stocks)})

def get_stock(request, token):
    username = __auth_token(request)['username']
    user = User.objects.get(username=username)

    stock = Stock.objects.filter(user=user, symbol=token).values('symbol', 'price', 'upper_limit', 'lower_limit')
    
    if not stock:
        return HttpResponse(status=404)

    return JsonResponse({'result': list(stock)[0]})


@csrf_exempt
def update_stock(request, token):
    username = __auth_token(request)['username']
    user = User.objects.get(username=username)

    if request.method == 'PUT':
        stock = Stock.objects.get(user=user, symbol=token)

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        symbol = body['symbol']
        upper_limit = body['upper_limit']
        lower_limit = body['lower_limit']

        stock.symbol = symbol
        stock.upper_limit = upper_limit
        stock.lower_limit = lower_limit
        stock.save()
        
        data = {
            'symbol': stock.symbol,
            'price': stock.price,
            'upper_limit': stock.upper_limit,
            'lower_limit': stock.lower_limit
        }
        return JsonResponse({'message': 'Update successfully!', 'result': data}) 

@csrf_exempt
def auth_token(request):
    try:
        user = __auth_token(request)
        return JsonResponse({'message': 'Token is valid!','user': user['username']})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': 'Token is expired!'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': 'Invalid token!'}, status=401)

@csrf_exempt
def login_get(request):
    body = json.loads(request.body)

    username = body['username']
    password = body['password']

    # login
    if username is None or password is None:
        return JsonResponse({'message': 'Email and password are required!'}, status=400)
    
    user = authenticate(username=username, password=password)

    if user is not None:
        token = jwt.encode({'username': username}, jwt_secret, algorithm='HS256')
        return JsonResponse({'message': 'Login successfully!', 'token': token.decode('utf-8')})
    else:
        return JsonResponse({'message': 'Login failed!'}, status=401)

@csrf_exempt
def delete_stock(request, token):
    username = __auth_token(request)['username']
    user = User.objects.get(username=username)

    if request.method == 'DELETE':
        stock = Stock.objects.get(user=user, symbol=token)
        stock.delete()

        return JsonResponse({'message': 'Deleted successfully!'})
