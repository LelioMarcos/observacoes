from django.db import models
from django.contrib.auth.models import BaseUserManager, AbstractUser

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("The Email field must be set")
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    username = None
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = [] # Add List of fields which you want to be required

    objects = CustomUserManager()

    def __str__(self):
        return self.email

# Create your models here.
class Stock(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    symbol = models.CharField(max_length=10)
    price = models.FloatField()
    upper_limit = models.FloatField()
    lower_limit = models.FloatField()
    period = models.IntegerField(default=1)

    def __str__(self):
        return self.symbol

    def is_to_buy(self):
        return self.price <= self.lower_limit
    
    def is_to_sell(self):
        return self.price >= self.upper_limit

    def __number_to_brl(self, price):
        return f'R${price:.2f}'.replace('.', ',')

    def buy_email(self):
        return {
            'about': "Sujestão para comprar ação",
            'body': f'Atualmente a ação {self.symbol} está no valor de {self.__number_to_brl(self.price)}, abaixo do limite inferior que você definiu ({self.__number_to_brl(self.lower_limit)}) para que seja sujerida a compra dessa ação.'
        }

    def sell_email(self):
        return {
            'about': "Sujestão para vender ação",
            'body': f'Atualmente a ação {self.symbol} está no valor de {self.__number_to_brl(self.price)}, acima do limite superior que você definiu ({self.__number_to_brl(self.upper_limit)}) para que seja sujerida a venda dessa ação.',
        }

class StockHistory(models.Model):
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE)
    price = models.FloatField()
    created_at = models.DateTimeField(auto_now_add=True)

