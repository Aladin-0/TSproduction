# Update your users/adapter.py

from allauth.account.adapter import DefaultAccountAdapter
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from django.contrib.auth import get_user_model, login as django_login
from allauth.exceptions import ImmediateHttpResponse
from django.http import HttpResponseRedirect
from django.conf import settings
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Redirect to our custom endpoint that handles token generation
        return 'http://127.0.0.1:8000/api/users/google-login-success/'

class CustomSocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Auto-link social account to existing user by verified email and log them in,
        bypassing the '3rd party signup' form.
        """
        # If already authenticated, do nothing (allauth will handle connect if needed)
        if request.user.is_authenticated:
            return

        email = (sociallogin.user.email or '').strip()
        if not email:
            return

        # Trust only verified emails for auto-linking
        email_verified = bool(sociallogin.account.extra_data.get('email_verified', False))
        if not email_verified:
            # Some providers use 'verified_email' (legacy); check that too
            email_verified = bool(sociallogin.account.extra_data.get('verified_email', False))

        if not email_verified:
            # Skip auto linking if provider didn't verify the email
            return

        User = get_user_model()
        try:
            existing_user = User.objects.get(email__iexact=email)
        except User.DoesNotExist:
            return

        # Link this social account to the existing user (if not already linked)
        if not sociallogin.is_existing:
            sociallogin.connect(request, existing_user)

        # Log in the existing user and redirect to our token success endpoint
        django_login(request, existing_user, backend='django.contrib.auth.backends.ModelBackend')
        redirect_url = 'http://127.0.0.1:8000/api/users/google-login-success/'
        raise ImmediateHttpResponse(HttpResponseRedirect(redirect_url))

    def is_auto_signup_allowed(self, request, sociallogin):
        """
        Allow auto-signup for brand new social users.
        Existing users are still auto-linked in pre_social_login.
        """
        return True

    def get_signup_form_class(self, request, sociallogin):
        """
        Use default behavior so Allauth will route to 3rd-party signup.
        Our urls.py intercepts that path and redirects to the frontend signup.
        """
        return super().get_signup_form_class(request, sociallogin)
    def save_user(self, request, sociallogin, form=None):
        """
        Save the user from Google OAuth data
        """
        user = sociallogin.user
        
        # Set user role to CUSTOMER if not set
        if not hasattr(user, 'role') or not user.role:
            user.role = 'CUSTOMER'
        
        # Ensure name is set from Google data if available
        if not user.name:
            user.name = sociallogin.account.extra_data.get('name') or 'Google User'
        
        # Ensure email is set
        if not user.email:
            email = sociallogin.account.extra_data.get('email')
            # Fallback if Google does not return email (rare but possible)
            if not email:
                # Use provider UID to generate a stable placeholder email
                uid = getattr(sociallogin.account, 'uid', None) or sociallogin.account.extra_data.get('sub')
                email = f"{uid or 'unknown'}@google.local"
            user.email = email
        
        # Normalize email to avoid NoneType.lower errors in downstream logic
        if user.email:
            try:
                user.email = user.email.lower()
            except Exception:
                # If anything goes wrong, keep original email
                pass
        
        user.save()
        return user

    def get_connect_redirect_url(self, request, socialaccount):
        # Redirect to our custom endpoint that handles token generation
        return 'http://127.0.0.1:8000/api/users/google-login-success/'