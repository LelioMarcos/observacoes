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
def send_email(subject, message, recipient_list):
    send_mail(subject, message, settings.EMAIL_HOST_USER, recipient_list)

@shared_task
def update_ativo_price():
    global minute_counter

    ativos = Stock.objects.all()

    if not ativos:
        return

    minute_counter += 1

    for ativo in ativos:
        if ativo.symbol == "TEST4":
            continue

        if minute_counter % ativo.period == 0:
            print(f'{minute_counter}: Checking {ativo.symbol} for {ativo.user.email}')
            new_price = api_b3.get_stock_price(ativo.symbol)

            ativo.price = new_price
            ativo.save()

            StockHistory.objects.create(stock=ativo, price=new_price)
            if ativo.is_to_buy():
                send_email.delay(
                    'Alerta para comprar ação',
                    f'Atualmente a ação {ativo.symbol} está no valor de {number_to_brl(ativo.price)}, abaixo do limite inferior que você definiu ({number_to_brl(ativo.lower_limit)}) para a compra dessa ação.',
                   [ativo.user.email]
                )
            elif ativo.is_to_sell():
                send_email.delay(
                    'Alerta para vender ação',
                    f'Atualmente a ação {ativo.symbol} está no valor de R${number_to_brl(ativo.price)}, acima do limite superior que você definiu ({number_to_brl(ativo.upper_limit)}) para a venda dessa ação.',
                    [ativo.user.email]
                )