# users/adapter.py - Complete working version with JWT token generation

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom adapter for regular email/password authentication"""
    
    def is_open_for_signup(self, request):
        return True


class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom adapter for Google OAuth with JWT token generation"""
    
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
        Handle authentication errors - CORRECT METHOD NAME for allauth 0.50+
        """
        print(f"=== OAuth Authentication Error ===")
        print(f"Provider: {provider}")
        print(f"Error: {error}")
        print(f"Exception: {exception}")
        
        # For "unknown" errors (usually state mismatch)
        if error == "unknown":
            print("⚠️ State mismatch detected - likely mobile browser retry issue")
            return HttpResponseRedirect(f'{settings.FRONTEND_BASE_URL}/login?error=oauth_retry')
        
        # For other errors, redirect to frontend with error message
        error_msg = str(exception) if exception else "Authentication failed"
        return HttpResponseRedirect(
            f'{settings.FRONTEND_BASE_URL}/login?error=oauth_failed&message={error_msg}'
        )
    
    def pre_social_login(self, request, sociallogin):
        """
        Auto-link social account to existing user by verified email
        """
        if request.user.is_authenticated:
            print(f"✓ User already authenticated: {request.user.email}")
            return

        email = (sociallogin.user.email or '').strip().lower()
        if not email:
            print("⚠️ No email provided in social login")
            return

        # Check if email is verified from Google
        email_verified = bool(
            sociallogin.account.extra_data.get('email_verified', False) or
            sociallogin.account.extra_data.get('verified_email', False)
        )

        if not email_verified:
            print(f"⚠️ Email not verified: {email}")
            return

        # Try to find existing user with this email
        try:
            existing_user = User.objects.get(email__iexact=email)
            print(f"✓ Found existing user: {existing_user.email}")
            
            # Connect social account to existing user
            if not sociallogin.is_existing:
                sociallogin.connect(request, existing_user)
                print(f"✓ Connected social account to existing user")
                
        except User.DoesNotExist:
            print(f"✓ New user, will create: {email}")
            pass
        except User.MultipleObjectsReturned:
            print(f"⚠️ Multiple users found with email: {email}")
            # Use the first one
            existing_user = User.objects.filter(email__iexact=email).first()
            if not sociallogin.is_existing:
                sociallogin.connect(request, existing_user)

    def is_auto_signup_allowed(self, request, sociallogin):
        """Allow automatic signup for Google OAuth"""
        return True
    
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user from Google OAuth data
        """
        try:
            user = sociallogin.user
            extra_data = sociallogin.account.extra_data
            
            # Get email from Google data
            email = extra_data.get('email', '').strip().lower()
            
            if not email:
                # Fallback: create a temporary email
                uid = sociallogin.account.uid
                email = f"google_{uid}@oauth.temp"
                print(f"⚠️ No email from Google, using: {email}")
            
            user.email = email
            
            # Get name from Google data
            name = extra_data.get('name', '').strip()
            if not name:
                given_name = extra_data.get('given_name', '')
                family_name = extra_data.get('family_name', '')
                name = f"{given_name} {family_name}".strip() or 'Google User'
            
            user.name = name
            
            # Set default role if not set
            if not hasattr(user, 'role') or not user.role:
                user.role = 'CUSTOMER'
            
            user.save()
            
            print(f"✓ Successfully saved user:")
            print(f"  - Email: {user.email}")
            print(f"  - Name: {user.name}")
            print(f"  - Role: {user.role}")
            
            return user
            
        except Exception as e:
            print(f"✗ ERROR in save_user: {str(e)}")
            print(f"  Google data: {sociallogin.account.extra_data}")
            raise
    
    def get_login_redirect_url(self, request):
        """
        CRITICAL: Generate JWT tokens and redirect to frontend with tokens in URL
        """
        try:
            user = request.user
            
            if not user or not user.is_authenticated:
                print("✗ No authenticated user for redirect")
                return f'{settings.FRONTEND_BASE_URL}/login?error=no_user'
            
            print(f"✓ Generating JWT tokens for user: {user.email}")
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)
            
            # Build redirect URL with tokens
            frontend_url = settings.FRONTEND_BASE_URL
            redirect_url = (
                f"{frontend_url}/?login=success"
                f"&access={access_token}"
                f"&refresh={refresh_token}"
                f"&email={user.email}"
            )
            
            print(f"✓ Redirecting to frontend with tokens")
            print(f"  - Access token length: {len(access_token)}")
            print(f"  - Refresh token length: {len(refresh_token)}")
            
            return redirect_url
            
        except Exception as e:
            print(f"✗ ERROR generating tokens: {str(e)}")
            return f'{settings.FRONTEND_BASE_URL}/login?error=token_generation_failed'
    
    def get_connect_redirect_url(self, request, socialaccount):
        """
        Redirect URL after connecting a social account
        """
        return self.get_login_redirect_url(request)