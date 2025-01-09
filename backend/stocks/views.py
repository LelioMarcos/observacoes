from django.http import HttpResponse, JsonResponse
from . import api_b3
import json
from .models import Stock, StockHistory, CustomUser
import os
from dotenv import load_dotenv
from django.contrib.auth.models import User
import jwt
from .tasks import send_email
from datetime import timezone, datetime, timedelta

load_dotenv(".env")
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

        if Stock.objects.filter(user=user, symbol=symbol):
            return JsonResponse({'message': 'Ação já cadastrada.'}, status=400)

        stock = Stock.objects.create(user=user, symbol=symbol, price=price, period=period, upper_limit=upper_limit, lower_limit=lower_limit)
        StockHistory.objects.create(stock=stock, price=price)

        if stock.is_to_buy():
            email = stock.buy_email()
            send_email.delay(email['about'], email['body'], stock.user.email)
        elif stock.is_to_sell():
            email = stock.sell_email()
            send_email.delay(email['about'], email['body'], stock.user.email)

        return JsonResponse({'message': 'Stock created successfully!'})

def get_all_stocks(request):
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

def update_stock(request, token):
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)

    if request.method == 'PUT':
        stock = Stock.objects.get(user=user, symbol=token)

        body_unicode = request.body.decode('utf-8')
        body = json.loads(body_unicode)

        stock.upper_limit = body['upper_limit']
        stock.lower_limit = body['lower_limit']
        stock.period = body['period']
        stock.save()
       
        data = {
            'symbol': stock.symbol,
            'price': stock.price,
            'upper_limit': stock.upper_limit,
            'lower_limit': stock.lower_limit,
            'period': stock.period,
        }
        return JsonResponse({'message': 'Update successfully!', 'result': data}) 

def delete_stock(request, token):
    email = __auth_token(request)['email']

    if not email:
        return JsonResponse({'message': 'Token is required!'}, status=401)

    user = CustomUser.objects.get(email=email)

    if request.method == 'DELETE':
        stock = Stock.objects.get(user=user, symbol=token)
        stock.delete()

        return JsonResponse({'message': 'Deleted successfully!'})

def auth_token(request):
    try:
        user = __auth_token(request)
        return JsonResponse({'message': 'Token is valid!','user': user['email']})
    except jwt.ExpiredSignatureError:
        return JsonResponse({'message': 'Token is expired!'}, status=401)
    except jwt.InvalidTokenError:
        return JsonResponse({'message': 'Invalid token!'}, status=401)

def user_login(request):
    body = json.loads(request.body)

    email = body['email']
    password = body['password']

    if email is None or password is None:
        return JsonResponse({'message': 'Email e senha são obrigatórios'}, status=400)

    try:
        user = CustomUser.objects.get(email=email)
    except CustomUser.DoesNotExist:
        return JsonResponse({'message': 'Email ou senha incorretos'}, status=401)

    if user.check_password(password):
        token = jwt.encode({
            'email': email, 
            'exp': datetime.now(tz=timezone.utc) + timedelta(hours=2) 
            }, jwt_secret, algorithm='HS256')
        return JsonResponse({'message': 'Login successfully!', 'token': token})
    else:
        return JsonResponse({'message': 'Email ou senha incorretos'}, status=401)

def user_register(request):
    body = json.loads(request.body)

    email = body['email']
    password = body['password']
    confirm_password = body['confirmPassword']

    if email is None or password is None or confirm_password is None:
        return JsonResponse({'message': 'Email and passwords are required!'}, status=400)

    if password != confirm_password:
        return JsonResponse({'message': 'Passwords do not match!'}, status=400)

    user = CustomUser.objects.create_user(email=email, password=password)

    if user is not None:
        return JsonResponse({'message': 'User created successfully!'})
    else:
        return JsonResponse({'message': 'User creation failed!'}, status=401)
