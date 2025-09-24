# ecom_project/urls.py

from django.contrib import admin
from django.urls import path, include  # <-- Add include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('dj_rest_auth.urls')),
    path('accounts/', include('allauth.urls')),
    path('', include('store.urls')),
    path('services/', include('services.urls')),
    path('api/users/', include('users.urls')),
    
    
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)