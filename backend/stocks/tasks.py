from django.core.mail import send_mail
from celery import shared_task
from .models import Stock, StockHistory
import requests
import datetime
from django.conf import settings
from . import api_b3

def number_to_brl(value):
    return f'R${value:.2f}'.replace('.', ',')

@shared_task
def send_email(subject, message, recipient):
    send_mail(subject, message, settings.EMAIL_HOST_USER, [recipient])

@shared_task
def update_ativo_price():
    stocks = Stock.objects.all()

    if not stocks:
        return
        
    for stock in stocks:
        if stock.symbol == "TEST4":
            continue
        
        last_record = StockHistory.objects.filter(stock=stock).last()
        
        if datetime.datetime.now(tz=datetime.timezone.utc).replace(second=0, microsecond=0) - last_record.created_at.replace(second=0, microsecond=0) >= datetime.timedelta(minutes=stock.period): 
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
