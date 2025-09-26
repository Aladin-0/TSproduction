# users/urls.py

from django.urls import path
from django.contrib.auth import views as auth_views
from . import views
from .views import (
    csrf_token_view, 
    CurrentUserView, 
    UserProfileUpdateView,
    ChangePasswordView,
    DeleteAccountView,
    GoogleLoginJWTView,
    DebugAuthView,
    create_user_from_google
)


urlpatterns = [
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('my-orders/', views.my_orders, name='my_orders'),
    path('add-address/', views.add_address, name='add_address'),
    path('technician/dashboard/', views.technician_dashboard, name='technician_dashboard'),
    
    # API endpoints
    path('csrf/', csrf_token_view, name='api-csrf'),
    path('me/', CurrentUserView.as_view(), name='api-me'),
    path('profile/', UserProfileUpdateView.as_view(), name='api-profile'),
    path('change-password/', ChangePasswordView.as_view(), name='api-change-password'),
    path('delete-account/', DeleteAccountView.as_view(), name='api-delete-account'),
    path('google-jwt/', GoogleLoginJWTView.as_view(), name='google-jwt'),
    path('debug-auth/', DebugAuthView.as_view(), name='debug-auth'),
    path('create-from-google/', create_user_from_google, name='create-from-google'),
]