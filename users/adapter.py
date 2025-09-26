# users/adapter.py
from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Use localhost instead of 127.0.0.1 to match your frontend
        return 'http://localhost:5173/?login=success'