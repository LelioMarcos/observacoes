from django.core.mail import send_mail
from celery import shared_task
from .models import Stock, StockHistory
import requests
import datetime
from django.conf import settings
from . import api_b3

@shared_task
def update_ativo_price():
    ativos = Stock.objects.all()

    for ativo in ativos:
        new_price = api_b3.get_stock_price(ativo.symbol)

        ativo.price = new_price
        ativo.save()

        StockHistory.objects.create(stock=ativo, price=new_price)

        if ativo.is_to_buy():
            print(f'Alerta de compra: {ativo.symbol} está abaixo do limite inferior')
            send_mail(
                'Alerta de compar ação',
                f'Atualmente a ação {ativo.symbol} está no valor de R${ativo.price}, abaixo do limite inferior que você definiu (R${ativo.lower_limit}).',
                settings.EMAIL_HOST_USER,
                [ativo.user.email]
            )
        elif ativo.is_to_sell():
            print(f'Alerta de venda: {ativo.symbol} está acima do limite superior')
            send_mail(
                'Alerta de vender ação',
                f'Atualmente a ação {ativo.symbol} está no valor de R${ativo.price}, acima do limite superior que você definiu (R${ativo.upper_limit}).',
                settings.EMAIL_HOST_USER,
                [ativo.user.email]
            )
