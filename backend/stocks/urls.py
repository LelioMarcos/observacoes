from django.urls import path, include

from . import views

urlpatterns = [
    path('', views.index, name="index"),
    path('add/', views.create_stock, name="add_stock"),
    path('get/', views.get_stocks, name="get_stocks"),
    path('get/<str:token>', views.get_stock, name="get_stock"),
    path('delete/<str:token>', views.delete_stock, name="delete_stock"),
]