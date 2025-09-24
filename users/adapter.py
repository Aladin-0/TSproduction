# users/adapter.py
from allauth.account.adapter import DefaultAccountAdapter

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Add a query parameter to the redirect URL
        url = super().get_login_redirect_url(request)
        return f"{url}?login=success"