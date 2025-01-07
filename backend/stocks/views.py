from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from . import api_b3
from django.core.serializers import serialize
import json
from .models import Stock, StockHistory, CustomUser
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
        return None

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
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)

    if request.method == 'POST':
        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        symbol = body['symbol']
        upper_limit = body['upper_limit']
        lower_limit = body['lower_limit']
        period = body['period']

        price = api_b3.get_stock_price(symbol)

        if not price:
            return JsonResponse({'message': 'Ação não encontrada.'}, status=404)

        stock = Stock.objects.create(user=user, symbol=symbol, price=price, period=period, upper_limit=upper_limit, lower_limit=lower_limit)
        StockHistory.objects.create(stock=stock, price=price)

        return JsonResponse({'message': 'Stock created successfully!'})

def get_stocks(request):
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)
    
    if request.method == 'GET':

        stocks = Stock.objects.filter(user=user)
        stocks_values = list(stocks.values('symbol', 'price', 'period', 'upper_limit', 'lower_limit'))

        for i, stock in enumerate(stocks):
            stock_history = StockHistory.objects.filter(stock=stock).values('price', 'created_at')
            stocks_values[i]['history'] = list(stock_history)

        print(stocks_values) 
        return JsonResponse({'result': stocks_values})

def get_stock(request, token):
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)

    stock = Stock.objects.filter(user=user, symbol=token)

    if not stock:
        return HttpResponse(status=404)

    stock_history = StockHistory.objects.filter(stock=list(stock)[0]).values('price', 'created_at')

    stock_values = list(stock.values('symbol', 'period', 'price', 'upper_limit', 'lower_limit'))[0]

    stock_values['history'] = list(stock_history)
    
    return JsonResponse({'result': stock_values})


@csrf_exempt
def update_stock(request, token):
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)

    if request.method == 'PUT':
        stock = Stock.objects.get(user=user, symbol=token)

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        symbol = body['symbol']
        upper_limit = body['upper_limit']
        lower_limit = body['lower_limit']
        period = body['period']

        stock.symbol = symbol
        stock.upper_limit = upper_limit
        stock.lower_limit = lower_limit
        stock.period = period
        stock.save()
       
        data = {
            'symbol': stock.symbol,
            'price': stock.price,
            'upper_limit': stock.upper_limit,
            'lower_limit': stock.lower_limit,
            'period': stock.period,
        }
        return JsonResponse({'message': 'Update successfully!', 'result': data}) 

@csrf_exempt
def auth_token(request):
    try:
        user = __auth_token(request)
        return JsonResponse({'message': 'Token is valid!','user': user['email']})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': 'Token is expired!'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': 'Invalid token!'}, status=401)

@csrf_exempt
def user_login(request):
    body = json.loads(request.body)

    email = body['email']
    password = body['password']

    # login
    if email is None or password is None:
        return JsonResponse({'message': 'Email and password are required!'}, status=400)

    user = CustomUser.objects.get(email=email)

    if user.check_password(password):
        token = jwt.encode({'email': email}, jwt_secret, algorithm='HS256')
        return JsonResponse({'message': 'Login successfully!', 'token': token})
    else:
        return JsonResponse({'message': 'Login failed!'}, status=401)

@csrf_exempt
def user_register(request):
    body = json.loads(request.body)

    email = body['email']
    password = body['password']
    confirm_password = body['confirmPassword']

    if email is None or password is None:
        return JsonResponse({'message': 'Email and password are required!'}, status=400)

    if password != confirm_password:
        return JsonResponse({'message': 'Passwords do not match!'}, status=400)

    user = CustomUser.objects.create_user(email=email, password=password)

    if user is not None:
        return JsonResponse({'message': 'User created successfully!'})
    else:
        return JsonResponse({'message': 'User creation failed!'}, status=401)

@csrf_exempt
def delete_stock(request, token):
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)

    if request.method == 'DELETE':
        stock = Stock.objects.get(user=user, symbol=token)
        stock.delete()

        return JsonResponse({'message': 'Deleted successfully!'})
