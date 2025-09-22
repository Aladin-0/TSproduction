# users/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from .forms import CustomerRegistrationForm, AddressForm
from store.models import Order
# Add TechnicianRating to this import
from services.models import ServiceRequest, TechnicianRating 

def customer_registration(request):
    if request.method == 'POST':
        form = CustomerRegistrationForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('product_list')
    else:
        form = CustomerRegistrationForm()
    
    return render(request, 'users/registration.html', {'form': form})

@login_required
def my_orders(request):
    orders = Order.objects.filter(customer=request.user).order_by('-order_date')
    context = {
        'orders': orders
    }
    return render(request, 'users/my_orders.html', context)

@login_required
def add_address(request):
    if request.method == 'POST':
        form = AddressForm(request.POST)
        if form.is_valid():
            address = form.save(commit=False)
            address.user = request.user
            address.save()
            next_page = request.GET.get('next', 'product_list')
            return redirect(next_page)
    else:
        form = AddressForm()
    
    return render(request, 'users/add_address.html', {'form': form})

@login_required
def technician_dashboard(request):
    if request.user.role != 'TECHNICIAN':
        return redirect('product_list')
    
    technician = request.user
    
    completed_orders = Order.objects.filter(technician=technician, status='DELIVERED').count()
    completed_services = ServiceRequest.objects.filter(technician=technician, status='COMPLETED').count()
    total_jobs = completed_orders + completed_services
    
    ratings = TechnicianRating.objects.filter(technician=technician).order_by('-created_at')
    average_rating = ratings.aggregate(Avg('rating'))
    
    context = {
        'total_jobs': total_jobs,
        'average_rating': average_rating['rating__avg'],
        'ratings': ratings,
    }
    return render(request, 'users/technician_dashboard.html', context)