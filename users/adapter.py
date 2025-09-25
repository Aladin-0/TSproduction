# users/adapter.py
from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings

class CustomAccountAdapter(DefaultAccountAdapter):
    def get_login_redirect_url(self, request):
        # Return the base React app URL with login success parameter
        return 'http://127.0.0.1:5173/?login=success'