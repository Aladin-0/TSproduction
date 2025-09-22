# ecom_project/urls.py

from django.contrib import admin
from django.urls import path, include  # <-- Add include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('users.urls')),
    path('', include('store.urls')),
    path('services/', include('services.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)