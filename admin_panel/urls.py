# admin_panel/urls.py - Complete URLs with all routes

from django.urls import path
from . import views

app_name = 'admin_panel'

urlpatterns = [
    # Main dashboard
    path('', views.AdminDashboardView.as_view(), name='dashboard'),
    
    # Users management
    path('users/', views.AdminUsersView.as_view(), name='users'),
    path('users/create/', views.AdminCreateUserView.as_view(), name='create_user'),
    path('users/<int:user_id>/edit/', views.AdminEditUserView.as_view(), name='edit_user'),
    path('users/<int:user_id>/delete/', views.AdminDeleteUserView.as_view(), name='delete_user'),
    
    # Products management
    path('products/', views.AdminProductsView.as_view(), name='products'),
    path('products/create/', views.AdminCreateProductView.as_view(), name='create_product'),
    path('products/<int:product_id>/edit/', views.AdminEditProductView.as_view(), name='edit_product'),
    path('products/<int:product_id>/delete/', views.AdminDeleteProductView.as_view(), name='delete_product'),
    
    # Orders management
    path('orders/', views.AdminOrdersView.as_view(), name='orders'),
    path('orders/<int:order_id>/edit/', views.AdminEditOrderView.as_view(), name='edit_order'),
    path('orders/<int:order_id>/delete/', views.AdminDeleteOrderView.as_view(), name='delete_order'),
    path('orders/<int:order_id>/assign/', views.AdminAssignTechnicianView.as_view(), name='assign_technician'),
    
    # Services management
    path('services/', views.AdminServicesView.as_view(), name='services'),
    path('services/<int:service_id>/edit/', views.AdminEditServiceView.as_view(), name='edit_service'),
    path('services/<int:service_id>/assign/', views.AdminAssignServiceTechnicianView.as_view(), name='assign_service_technician'),
    
    # Categories management (FIXED ROUTES)
    path('categories/', views.AdminCategoriesView.as_view(), name='categories'),
    path('categories/create/', views.AdminCreateCategoryView.as_view(), name='create_category'),
    path('categories/<int:category_id>/edit/', views.AdminEditCategoryView.as_view(), name='edit_category'),
    path('categories/<int:category_id>/delete/', views.AdminDeleteCategoryView.as_view(), name='delete_category'),
    
    # Analytics
    path('analytics/', views.AdminAnalyticsView.as_view(), name='analytics'),
    
    # Settings
    path('settings/', views.AdminSettingsView.as_view(), name='settings'),
    
    # API endpoints for AJAX operations
    path('api/stats/', views.admin_stats_api, name='api_stats'),
    path('api/orders/<int:order_id>/', views.get_order_details_api, name='api_order_details'),
    path('api/assign-technician/', views.assign_technician_api, name='api_assign_technician'),
    path('api/assign-service-technician/', views.assign_service_technician_api, name='api_assign_service_technician'),
    path('api/update-order-status/', views.update_order_status_api, name='api_update_order_status'),
    path('api/update-service-status/', views.update_service_status_api, name='api_update_service_status'),

    # Job Sheets management
    path('job-sheets/', views.AdminJobSheetsView.as_view(), name='job_sheets'),
    path('job-sheets/<int:job_sheet_id>/', views.AdminJobSheetDetailView.as_view(), name='job_sheet_detail'),
    path('job-sheets/<int:job_sheet_id>/delete/', views.AdminDeleteJobSheetView.as_view(), name='delete_job_sheet'),
    # Job Sheet API
    path('api/job-sheets/<int:job_sheet_id>/', views.get_job_sheet_details_api, name='api_job_sheet_details'),  
    path('api/service/<int:service_id>/', views.api_get_service_detail, name='api_service_detail'),
]