# users/adapter.py - Fixed version with correct allauth method

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp
from django.contrib.auth import get_user_model, login as django_login
from allauth.exceptions import ImmediateHttpResponse
from django.http import HttpResponseRedirect
from django.conf import settings

User = get_user_model()

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Redirect to our custom endpoint that handles token generation
        return f'{settings.FRONTEND_BASE_URL}/?login=success'

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    
    def get_app(self, request, provider, client_id=None):
        """
        Override to fix MultipleObjectsReturned error
        """
        apps = SocialApp.objects.filter(provider=provider)
        valid_apps = [app for app in apps if app.name and app.client_id]
        
        if client_id:
            valid_apps = [app for app in valid_apps if app.client_id == client_id]
        
        if len(valid_apps) == 0:
            raise SocialApp.DoesNotExist(f"No {provider} app found")
        
        return valid_apps[0]
    
    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        """
        Handle authentication errors (NEW METHOD - replaces authentication_error)
        """
        print(f"=== OAuth Authentication Error ===")
        print(f"Provider: {provider}")
        print(f"Error: {error}")
        print(f"Exception: {exception}")
        print(f"Session key: {request.session.session_key}")
        print(f"Has session: {hasattr(request, 'session')}")
        
        # For "unknown" errors (usually state mismatch), this is likely mobile simulator issue
        # Redirect to frontend instead of showing error page
        if error == "unknown":
            print("State mismatch detected - likely mobile browser retry issue")
            return HttpResponseRedirect(f'{settings.FRONTEND_BASE_URL}/login?error=oauth_retry')
        
        # For other errors, use default behavior
        return super().on_authentication_error(request, provider, error, exception, extra_context)
    
    def pre_social_login(self, request, sociallogin):
        """
        Auto-link social account to existing user by verified email
        """
        if request.user.is_authenticated:
            return

        email = (sociallogin.user.email or '').strip()
        if not email:
            return

        email_verified = bool(
            sociallogin.account.extra_data.get('email_verified', False) or
            sociallogin.account.extra_data.get('verified_email', False)
        )

        if not email_verified:
            return

        try:
            existing_user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return

        if not sociallogin.is_existing:
            sociallogin.connect(request, existing_user)

        django_login(request, existing_user, backend='django.contrib.auth.backends.ModelBackend')
        redirect_url = 'http://127.0.0.1:8000/api/users/google-login-success/'
        raise ImmediateHttpResponse(HttpResponseRedirect(redirect_url))

    def is_auto_signup_allowed(self, request, sociallogin):
        return True

    def get_signup_form_class(self, request, sociallogin):
        return super().get_signup_form_class(request, sociallogin)
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user from Google OAuth data
        """
        try:
            user = sociallogin.user
            email = sociallogin.account.extra_data.get('email')
            
            if not email:
                uid = sociallogin.account.uid
                email = f"{uid}@google.oauth"
            
            user.email = email.strip().lower() if email else f"user_{sociallogin.account.uid}@temp.com"
            user.name = sociallogin.account.extra_data.get('name', '').strip() or 'Google User'
            
            if not hasattr(user, 'role') or not user.role:
                user.role = 'CUSTOMER'
            
            user.save()
            print(f"✓ Successfully created user: {user.email}")
            return user
            
        except Exception as e:
            print(f"✗ ERROR in save_user: {str(e)}")
            print(f"Google data: {sociallogin.account.extra_data}")
            raise

    def get_connect_redirect_url(self, request, socialaccount):
        return 'http://127.0.0.1:8000/api/users/google-login-success/'