from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Stock(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)
    price = models.FloatField()
    upper_limit = models.FloatField()
    lower_limit = models.FloatField()

    def __str__(self):
        return self.symbol

    def is_to_buy(self):
        return self.price <= self.lower_limit
    
    def is_to_sell(self):
        return self.price >= self.upper_limit

class StockHistory(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    price = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)