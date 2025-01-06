from django.core.mail import send_mail
from celery import shared_task
from .models import Stock, StockHistory
import requests
import datetime
from django.conf import settings
from . import api_b3

minute_counter = 0

@shared_task
def update_ativo_price():
    global minute_counter

    ativos = Stock.objects.all()

    if not ativos:
        return

    minute_counter += 1

    for ativo in ativos:
        if minute_counter % ativo.period == 0:
            print(f'{minute_counter}: Checking {ativo.symbol} for {ativo.user.email}')
            new_price = api_b3.get_stock_price(ativo.symbol)

            ativo.price = new_price
            ativo.save()

            StockHistory.objects.create(stock=ativo, price=new_price)
            if ativo.is_to_buy():
                print(f'Alerta de compra: {ativo.symbol} está abaixo do limite inferior para {ativo.user.email}')
                send_mail(
                    'Alerta para comprar ação',
                    f'Atualmente a ação {ativo.symbol} está no valor de R${ativo.price}, abaixo do limite inferior que você definiu (R${ativo.lower_limit}).',
                   settings.EMAIL_HOST_USER,
                   [ativo.user.email]
               )
            elif ativo.is_to_sell():
                print(f'Alerta de venda: {ativo.symbol} está acima do limite superior para {ativo.user.email}')
                send_mail(
                    'Alerta para vender ação',
                    f'Atualmente a ação {ativo.symbol} está no valor de R${ativo.price}, acima do limite superior que você definiu (R${ativo.upper_limit}).',
                    settings.EMAIL_HOST_USER,
                    [ativo.user.email]
               )