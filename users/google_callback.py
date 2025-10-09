# users/google_callback.py - With forced account selection and proper logout

from django.http import HttpResponseRedirect, HttpResponse
from django.conf import settings
from django.contrib.auth import logout
from rest_framework_simplejwt.tokens import RefreshToken
from django.views.decorators.csrf import csrf_exempt
import sys


@csrf_exempt
def custom_google_callback(request):
    """
    Custom callback that intercepts the Google OAuth flow and generates JWT tokens
    """
    print("\n" + "="*70, flush=True)
    print("CUSTOM GOOGLE CALLBACK INTERCEPTED", flush=True)
    print("="*70, flush=True)
    sys.stdout.flush()
    
    # Check if user is authenticated
    if not request.user.is_authenticated:
        print("✗ User not authenticated in callback", flush=True)
        sys.stdout.flush()
        return HttpResponseRedirect(f'{settings.FRONTEND_BASE_URL}/login?error=not_authenticated')
    
    user = request.user
    print(f"✓ User authenticated: {user.email}", flush=True)
    sys.stdout.flush()
    
    try:
        # Generate JWT tokens
        print("Generating JWT tokens...", flush=True)
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        
        print(f"✓ Tokens generated successfully!", flush=True)
        print(f"  - Access token length: {len(access_token)}", flush=True)
        print(f"  - Refresh token length: {len(refresh_token)}", flush=True)
        sys.stdout.flush()
        
        # Build redirect URL with tokens
        redirect_url = (
            f"{settings.FRONTEND_BASE_URL}/?login=success"
            f"&access={access_token}"
            f"&refresh={refresh_token}"
            f"&email={user.email}"
        )
        
        print(f"✓ Redirecting to: {redirect_url[:80]}...", flush=True)
        print("="*70 + "\n", flush=True)
        sys.stdout.flush()
        
        # IMPORTANT: Logout from Django session after generating tokens
        # This prevents the "sticky session" issue where Google reuses the same account
        logout(request)
        print("✓ Django session cleared", flush=True)
        sys.stdout.flush()
        
        return HttpResponseRedirect(redirect_url)
        
    except Exception as e:
        print(f"✗ ERROR: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
        sys.stdout.flush()
        return HttpResponseRedirect(f'{settings.FRONTEND_BASE_URL}/login?error=token_generation_failed')


@csrf_exempt
def force_google_logout(request):
    """
    Endpoint to force logout from Google OAuth session before redirecting to login
    """
    print("🚪 Forcing Google OAuth logout...", flush=True)
    sys.stdout.flush()
    
    # Logout from Django session
    logout(request)
    
    # Redirect to Google login with prompt=select_account
    # This forces Google to show the account selection screen
    return HttpResponseRedirect('/accounts/google/login/?prompt=select_account')