# services/urls.py - Updated with rating endpoints

from django.urls import path
from . import views

urlpatterns = [
    # Existing service URLs
    path('', views.select_service_category, name='select_service_category'),
    path('request/<int:category_id>/', views.create_service_request, name='create_service_request'),
    path('request/successful/', views.request_successful, name='request_successful'),
    path('payment/<int:request_id>/', views.service_payment_page, name='service_payment_page'),
    path('confirm-request/<int:request_id>/', views.confirm_service_request, name='confirm_service_request'),
    path('rate/order/<int:order_id>/', views.rate_order, name='rate_order'),
    path('update-service-status/<int:request_id>/', views.update_service_status, name='update_service_status'),
    
    # API endpoints
    path('api/categories/', views.ServiceCategoryListAPIView.as_view(), name='api_service_category_list'),
    path('api/requests/create/', views.ServiceRequestCreateAPIView.as_view(), name='api_service_request_create'),
    
    # Rating API endpoints
    path('api/ratings/create/', views.create_rating, name='api_create_rating'),
    path('api/ratings/my-ratings/', views.get_user_ratings, name='api_user_ratings'),
    path('api/ratings/test/', views.test_rating_endpoint, name='api_test_rating'),
]