# ecom_project/urls.py - FIXED VERSION

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from users.admin_views import admin_dashboard
from users.views import redirect_third_party_signup
from users.google_login_view import custom_google_login

# Customize admin site
admin.site.site_header = "TechVerse Administration"
admin.site.site_title = "TechVerse Admin"
admin.site.index_title = "Welcome to TechVerse Administration"
admin.site.index_template = 'admin/index.html'

urlpatterns = [
    # Custom Admin Panel
    path('admin-panel/', include('admin_panel.urls')),
    
    # Django Admin
    path('admin/', admin.site.urls),
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),
    
    # AUTH ENDPOINTS
    path('api/auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    
    # Custom Google OAuth (BEFORE allauth URLs)
    path('auth/google/login/', custom_google_login, name='custom_google_login'),
    path('accounts/3rdparty/signup/', redirect_third_party_signup, name='redirect_3rdparty_signup'),
    
    # Allauth URLs
    path('accounts/', include('allauth.urls')),
    
    # App URLs
    path('', include('store.urls')),
    path('services/', include('services.urls')),
    path('api/users/', include('users.urls')),
]

# Override admin index view
admin.site.index = admin_dashboard

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)