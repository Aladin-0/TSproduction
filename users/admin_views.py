# users/admin_views.py - Admin dashboard with statistics

from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.db.models import Avg, Count
from django.contrib.auth import get_user_model
from store.models import Order, Product
from services.models import ServiceRequest, TechnicianRating

User = get_user_model() 

@staff_member_required
def admin_dashboard(request):
    """Custom admin dashboard with statistics"""
    
    # Order statistics
    total_orders = Order.objects.count()
    unassigned_orders = Order.objects.filter(technician__isnull=True).count()
    delivered_orders = Order.objects.filter(status='DELIVERED').count()
    
    # Service request statistics
    total_services = ServiceRequest.objects.count()
    unassigned_services = ServiceRequest.objects.filter(technician__isnull=True).count()
    completed_services = ServiceRequest.objects.filter(status='COMPLETED').count()
    
    # Technician statistics
    total_technicians = User.objects.filter(role='TECHNICIAN').count()
    active_technicians = User.objects.filter(
        role='TECHNICIAN', 
        is_active=True
    ).count()
    
    # Average technician rating
    avg_rating = TechnicianRating.objects.aggregate(
        avg_rating=Avg('rating')
    )['avg_rating'] or 0
    
    # Product statistics
    total_products = Product.objects.count()
    active_products = Product.objects.filter(is_active=True).count()
    low_stock_products = Product.objects.filter(stock__lt=5).count()
    
    # Recent activity
    recent_unassigned_orders = Order.objects.filter(
        technician__isnull=True
    ).select_related('customer').order_by('-order_date')[:5]
    
    recent_unassigned_services = ServiceRequest.objects.filter(
        technician__isnull=True
    ).select_related('customer', 'service_category').order_by('-request_date')[:5]
    
    context = {
        'title': 'TechVerse Admin Dashboard',
        'total_orders': total_orders,
        'unassigned_orders': unassigned_orders,
        'delivered_orders': delivered_orders,
        'total_services': total_services,
        'unassigned_services': unassigned_services,
        'completed_services': completed_services,
        'total_technicians': total_technicians,
        'active_technicians': active_technicians,
        'avg_technician_rating': avg_rating,
        'total_products': total_products,
        'active_products': active_products,
        'low_stock_products': low_stock_products,
        'recent_unassigned_orders': recent_unassigned_orders,
        'recent_unassigned_services': recent_unassigned_services,
    }
    
    return render(request, 'admin/index.html', context)