from django.urls import path, include

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('login/', views.user_login, name="login"),
    path('register/', views.user_register, name="register"),
    path('auth/', views.auth_token, name="auth_token"),
    path('add/', views.create_stock, name="add_stock"),
    path('get/', views.get_stocks, name="get_stocks"),
    path('get/<str:token>', views.get_stock, name="get_stock"),
    path('update/<str:token>', views.update_stock, name="update_stock"),
    path('delete/<str:token>', views.delete_stock, name="delete_stock"),
]