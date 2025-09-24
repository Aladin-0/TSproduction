# users/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .views import csrf_token_view, CurrentUserView

urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('my-orders/', views.my_orders, name='my_orders'),
    path('add-address/', views.add_address, name='add_address'),
    path('technician/dashboard/', views.technician_dashboard, name='technician_dashboard'),
    path('csrf/', csrf_token_view, name='api-csrf'),
    path('me/', CurrentUserView.as_view(), name='api-me'),
]