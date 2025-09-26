# store/urls.py - Remove the my_orders line since it belongs in users URLs

from django.urls import path
from . import views

urlpatterns = [
    # Existing store URLs
    path('', views.product_list, name='product_list'),
    path('product/<slug:slug>/', views.product_detail, name='product_detail'),
    path('buy-now/<slug:slug>/', views.buy_now, name='buy_now'),
    path('select-address/<int:order_id>/', views.select_address, name='select_address'),
    path('payment/<int:order_id>/', views.payment_page, name='payment_page'),
    path('confirm-order/<int:order_id>/', views.confirm_order, name='confirm_order'),
    path('order-successful/<int:order_id>/', views.order_successful, name='order_successful'),
    path('update-order-status/<int:order_id>/', views.update_order_status, name='update_order_status'),

    # API endpoints
    path('api/products/', views.ProductListAPIView.as_view(), name='api_product_list'),
    path('api/addresses/', views.AddressListAPIView.as_view(), name='api_address_list'),
    path('api/addresses/create/', views.AddressCreateAPIView.as_view(), name='api_address_create'),
    path('api/addresses/<int:pk>/update/', views.AddressUpdateAPIView.as_view(), name='api_address_update'),
    path('api/addresses/<int:pk>/delete/', views.AddressDeleteAPIView.as_view(), name='api_address_delete'),
    
    # Order API endpoints (if you want them here, but they should be separate)
    # path('api/orders/', views.UserOrdersListView.as_view(), name='api_orders_list'),
    # path('api/orders/<int:pk>/', views.OrderDetailView.as_view(), name='api_order_detail'),
    # path('api/orders/create/', views.create_order, name='api_create_order'),
    # path('api/orders/<int:order_id>/cancel/', views.cancel_order, name='api_cancel_order'),
]