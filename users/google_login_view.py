# users/google_login_view.py - Custom Google login view that forces account selection

from django.http import HttpResponseRedirect
from allauth.socialaccount.models import SocialApp
from django.views.decorators.csrf import csrf_exempt
import urllib.parse


@csrf_exempt
def custom_google_login(request):
    """
    Custom Google OAuth login that forces account selection
    """
    # Get Google OAuth app
    try:
        google_app = SocialApp.objects.get(provider='google')
    except SocialApp.DoesNotExist:
        return HttpResponseRedirect('/login?error=google_not_configured')
    
    # Build OAuth URL manually with prompt=select_account
    client_id = google_app.client_id
    redirect_uri = 'http://127.0.0.1:8000/accounts/google/login/callback/'
    
    # OAuth parameters
    params = {
        'client_id': client_id,
        'redirect_uri': redirect_uri,
        'scope': 'openid email profile',
        'response_type': 'code',
        'access_type': 'online',
        'prompt': 'select_account',  # Force account selection
    }
    
    # Build URL
    auth_url = 'https://accounts.google.com/o/oauth2/v2/auth?' + urllib.parse.urlencode(params)
    
    print(f"🔐 Redirecting to Google OAuth with prompt=select_account", flush=True)
    print(f"   URL: {auth_url[:100]}...", flush=True)
    
    return HttpResponseRedirect(auth_url)