# ecom_project/urls.py - Updated with custom admin dashboard

from django.contrib import admin
from django.urls import path, include  # <-- Add include
from django.conf import settings
from django.conf.urls.static import static
from users.admin_views import admin_dashboard

# Customize admin site
admin.site.site_header = "TechVerse Administration"
admin.site.site_title = "TechVerse Admin"
admin.site.index_title = "Welcome to TechVerse Administration"

# Custom admin index view
admin.site.index_template = 'admin/index.html'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('admin-dashboard/', admin_dashboard, name='admin_dashboard'),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('accounts/', include('allauth.urls')),
    path('', include('store.urls')),
    path('services/', include('services.urls')),
    path('api/users/', include('users.urls')),
]

# Override admin index view
admin.site.index = admin_dashboard

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)