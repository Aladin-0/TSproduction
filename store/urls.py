# store/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('', views.product_list, name='product_list'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    path('buy-now/<slug:slug>/', views.buy_now, name='buy_now'),
    path('select-address/<int:order_id>/', views.select_address, name='select_address'),
    path('payment/<int:order_id>/', views.payment_page, name='payment_page'),
    path('confirm-order/<int:order_id>/', views.confirm_order, name='confirm_order'),
    path('order-successful/<int:order_id>/', views.order_successful, name='order_successful'),
    path('update-order-status/<int:order_id>/', views.update_order_status, name='update_order_status'),

    path('api/products/', views.ProductListAPIView.as_view(), name='api_product_list'),
]