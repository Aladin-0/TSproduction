# Update your users/adapter.py

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Redirect to our custom endpoint that handles token generation
        return 'http://127.0.0.1:8000/api/users/google-login-success/'

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user from Google OAuth data
        """
        user = sociallogin.user
        
        # Set user role to CUSTOMER if not set
        if not hasattr(user, 'role') or not user.role:
            user.role = 'CUSTOMER'
        
        # Ensure name is set from Google data if available
        if sociallogin.account.extra_data.get('name') and not user.name:
            user.name = sociallogin.account.extra_data.get('name')
        
        # Ensure email is set
        if not user.email and sociallogin.account.extra_data.get('email'):
            user.email = sociallogin.account.extra_data.get('email')
        
        user.save()
        return user

    def get_connect_redirect_url(self, request, socialaccount):
        # Redirect to our custom endpoint that handles token generation
        return 'http://127.0.0.1:8000/api/users/google-login-success/'