from django.core.mail import send_mail
from celery import shared_task
from .models import Stock, StockHistory
import requests
import datetime
from django.conf import settings
from . import api_b3

minute_counter = 0

def number_to_brl(value):
    return f'R${value:.2f}'.replace('.', ',')

@shared_task
def send_email(subject, message, recipient):
    send_mail(subject, message, settings.EMAIL_HOST_USER, [recipient])

@shared_task
def update_ativo_price():
    global minute_counter

    stocks = Stock.objects.all()

    if not stocks:
        return

    minute_counter += 1

    for stock in stocks:
        if stock.symbol == "TEST4":
            continue

        if minute_counter % stock.period == 0:
            print(f'{minute_counter}: Checking {stock.symbol} for {stock.user.email}')
            new_price = api_b3.get_stock_price(stock.symbol)

            old_price = stock.price
            stock.price = new_price
            stock.save()
            StockHistory.objects.create(stock=stock, price=new_price)
            
            if new_price == old_price:
                print("Same price. Not sending email.")
                continue
            if stock.is_to_buy():
                email = stock.buy_email()
                send_email.delay(email['about'], email['body'], stock.user.email)
            elif stock.is_to_sell():
                email = stock.sell_email()
                send_email.delay(email['about'], email['body'], stock.user.email)