# users/urls.py - Updated with profile validation

from django.urls import path
from django.contrib.auth import views as auth_views
from . import views

urlpatterns = [
    # Template views
    path('login/', auth_views.LoginView.as_view(template_name='users/login.html'), name='login'),
    path('logout/', auth_views.LogoutView.as_view(), name='logout'),
    path('my-orders/', views.my_orders, name='my_orders'),
    path('add-address/', views.add_address, name='add_address'),
    path('technician/dashboard/', views.technician_dashboard, name='technician_dashboard'),
    
    # API endpoints
    path('csrf/', views.csrf_token_view, name='api-csrf'),
    path('me/', views.CurrentUserView.as_view(), name='api-me'),
    path('profile/', views.UserProfileUpdateView.as_view(), name='api-profile'),
    path('profile/validate/', views.ProfileValidationView.as_view(), name='api-profile-validate'),
    path('change-password/', views.ChangePasswordView.as_view(), name='api-change-password'),
    path('delete-account/', views.DeleteAccountView.as_view(), name='api-delete-account'),
    
    # Google OAuth JWT endpoints
    path('google-jwt/', views.GoogleJWTTokenView.as_view(), name='google-jwt-token'),
    path('google-login-success/', views.google_login_success, name='google-login-success'),
    path('debug-auth/', views.DebugAuthView.as_view(), name='debug-auth'),
    path('create-from-google/', views.create_user_from_google, name='create-from-google'),
    
    # Google OAuth success handler
    path('google-login-success/', views.google_login_success, name='google_login_success'),
    
    # Alternative callback for mobile apps
    path('google-auth-callback/', views.google_auth_callback, name='google_auth_callback'),
]