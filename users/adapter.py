# users/adapter.py - WITH ENHANCED DEBUGGING

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.socialaccount.models import SocialApp
from django.contrib.auth import get_user_model
from django.http import HttpResponseRedirect
from django.conf import settings
from rest_framework_simplejwt.tokens import RefreshToken
import sys

User = get_user_model()


class CustomAccountAdapter(DefaultAccountAdapter):
    """Custom adapter for regular email/password authentication"""
    
    def is_open_for_signup(self, request):
        return True
    
    def get_login_redirect_url(self, request):
        """Override account login redirect"""
        print("\n" + "="*70, flush=True)
        print("ACCOUNT ADAPTER get_login_redirect_url CALLED", flush=True)
        print("="*70 + "\n", flush=True)
        sys.stdout.flush()
        
        # Check if this is a social login
        # If user has social accounts, delegate to social adapter behavior
        if hasattr(request.user, 'socialaccount_set') and request.user.socialaccount_set.exists():
            print("✓ Detected social login, generating JWT tokens...", flush=True)
            sys.stdout.flush()
            
            try:
                user = request.user
                
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
                
                print(f"✓ JWT Tokens generated successfully!", flush=True)
                print(f"  - Access token length: {len(access_token)}", flush=True)
                print(f"  - Redirect URL: {redirect_url[:100]}...", flush=True)
                print("="*70 + "\n", flush=True)
                sys.stdout.flush()
                
                return redirect_url
                
            except Exception as e:
                print(f"✗ ERROR generating tokens: {str(e)}", flush=True)
                import traceback
                traceback.print_exc()
                sys.stdout.flush()
                return f'{settings.FRONTEND_BASE_URL}/login?error=token_generation_failed'
        
        # Regular login - just redirect to frontend
        return settings.FRONTEND_BASE_URL

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    """Custom adapter for Google OAuth with JWT token generation"""
    
    def get_app(self, request, provider, client_id=None):
        """Override to fix MultipleObjectsReturned error"""
        apps = SocialApp.objects.filter(provider=provider)
        valid_apps = [app for app in apps if app.name and app.client_id]
        
        if client_id:
            valid_apps = [app for app in valid_apps if app.client_id == client_id]
        
        if len(valid_apps) == 0:
            raise SocialApp.DoesNotExist(f"No {provider} app found")
        
        return valid_apps[0]
    
    def on_authentication_error(self, request, provider, error=None, exception=None, extra_context=None):
        """Handle authentication errors"""
        print(f"=== OAuth Authentication Error ===", flush=True)
        print(f"Provider: {provider}", flush=True)
        print(f"Error: {error}", flush=True)
        print(f"Exception: {exception}", flush=True)
        sys.stdout.flush()
        
        error_msg = str(exception) if exception else "Authentication failed"
        return HttpResponseRedirect(
            f'{settings.FRONTEND_BASE_URL}/login?error=oauth_failed&message={error_msg}'
        )
    
    def save_user(self, request, sociallogin, form=None):
        """Enhanced user creation from Google OAuth"""
        try:
            user = sociallogin.user
            extra_data = sociallogin.account.extra_data
            
            print(f"=== SAVE_USER CALLED ===", flush=True)
            print(f"  Email: {user.email}", flush=True)
            print(f"  Name from Google: {extra_data.get('name', 'N/A')}", flush=True)
            sys.stdout.flush()
            
            # Set name from Google data
            if not user.name or user.name == '':
                user.name = extra_data.get('name', user.email.split('@')[0])
            
            # Set default role if not set
            if not hasattr(user, 'role') or not user.role:
                user.role = 'CUSTOMER'
            
            # Save the user
            user.save()
            
            print(f"✓ User saved successfully", flush=True)
            print(f"  ID: {user.id}", flush=True)
            print(f"  Email: {user.email}", flush=True)
            print(f"  Name: {user.name}", flush=True)
            print(f"  Role: {user.role}", flush=True)
            sys.stdout.flush()
            
            return user
            
        except Exception as e:
            print(f"✗ ERROR in save_user: {str(e)}", flush=True)
            print(f"  Google data: {sociallogin.account.extra_data}", flush=True)
            sys.stdout.flush()
            raise
    
    def get_login_redirect_url(self, request):
        """
        CRITICAL: Generate JWT tokens and redirect to frontend with tokens in URL
        """
        print("\n" + "="*70, flush=True)
        print("SOCIAL ADAPTER get_login_redirect_url CALLED", flush=True)
        print("="*70, flush=True)
        sys.stdout.flush()
        
        try:
            user = request.user
            
            print(f"User authenticated: {user.is_authenticated}", flush=True)
            print(f"User email: {user.email if user.is_authenticated else 'N/A'}", flush=True)
            sys.stdout.flush()
            
            if not user or not user.is_authenticated:
                print("✗ No authenticated user for redirect", flush=True)
                sys.stdout.flush()
                return f'{settings.FRONTEND_BASE_URL}/login?error=no_user'
            
            print(f"✓ Generating JWT tokens for user: {user.email}", flush=True)
            sys.stdout.flush()
            
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
            
            print(f"✓ JWT Tokens generated successfully!", flush=True)
            print(f"  - Access token length: {len(access_token)}", flush=True)
            print(f"  - Refresh token length: {len(refresh_token)}", flush=True)
            print(f"  - Redirect URL: {redirect_url[:100]}...", flush=True)
            print("="*70 + "\n", flush=True)
            sys.stdout.flush()
            
            return redirect_url
            
        except Exception as e:
            print(f"✗ ERROR generating tokens: {str(e)}", flush=True)
            import traceback
            traceback.print_exc()
            sys.stdout.flush()
            return f'{settings.FRONTEND_BASE_URL}/login?error=token_generation_failed'
    
    def pre_social_login(self, request, sociallogin):
        """Auto-link social account to existing user by verified email"""
        if request.user.is_authenticated:
            print(f"✓ User already authenticated: {request.user.email}", flush=True)
            sys.stdout.flush()
            return

        email = (sociallogin.user.email or '').strip().lower()
        if not email:
            print("⚠️ No email provided in social login", flush=True)
            sys.stdout.flush()
            return

        # Check if email is verified from Google
        email_verified = bool(
            sociallogin.account.extra_data.get('email_verified', False) or
            sociallogin.account.extra_data.get('verified_email', False)
        )

        if not email_verified:
            print(f"⚠️ Email not verified: {email}", flush=True)
            sys.stdout.flush()
            return

        # Try to find existing user with this email
        try:
            existing_user = User.objects.get(email__iexact=email)
            print(f"✓ Found existing user: {existing_user.email}", flush=True)
            sys.stdout.flush()
            
            # Connect social account to existing user
            if not sociallogin.is_existing:
                sociallogin.connect(request, existing_user)
                print(f"✓ Connected social account to existing user", flush=True)
                sys.stdout.flush()
                
        except User.DoesNotExist:
            print(f"✓ New user, will create: {email}", flush=True)
            sys.stdout.flush()
            pass
        except User.MultipleObjectsReturned:
            print(f"⚠️ Multiple users found with email: {email}", flush=True)
            sys.stdout.flush()
            existing_user = User.objects.filter(email__iexact=email).first()
            if existing_user and not sociallogin.is_existing:
                sociallogin.connect(request, existing_user)
                print(f"✓ Connected to first matching user", flush=True)
                sys.stdout.flush()