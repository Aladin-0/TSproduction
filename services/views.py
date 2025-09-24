# services/views.py

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import ServiceCategory, ServiceRequest
from .forms import ServiceRequestForm
from .models import ServiceCategory, ServiceRequest, TechnicianRating
from store.models import Order
from .forms import ServiceRequestForm, RatingForm
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions
from .serializers import ServiceCategorySerializer, ServiceRequestSerializer

@login_required
def select_service_category(request):
    categories = ServiceCategory.objects.all()
    return render(request, 'services/select_category.html', {'categories': categories})

@login_required
def create_service_request(request, category_id):
    category = get_object_or_404(ServiceCategory, id=category_id)

    if request.method == 'POST':
        form = ServiceRequestForm(request.POST, user=request.user, category=category)
        if form.is_valid():
            service_request = form.save(commit=False)
            service_request.customer = request.user
            service_request.service_category = category
            service_request.save()
            # We will create this 'request_successful' page next
            return redirect('request_successful') 
    else:
        # Pass user and category to the form to filter the dropdowns
        form = ServiceRequestForm(user=request.user, category=category)

    return render(request, 'services/create_request.html', {'form': form, 'category': category})

@login_required
def request_successful(request):
    return render(request, 'services/request_successful.html')

@login_required
def create_service_request(request, category_id):
    category = get_object_or_404(ServiceCategory, id=category_id)

    if request.method == 'POST':
        form = ServiceRequestForm(request.POST, user=request.user, category=category)
        if form.is_valid():
            service_request = form.save(commit=False)
            service_request.customer = request.user
            service_request.service_category = category
            service_request.save()

            # --- NEW LOGIC ---
            # Check if the user is an AMC customer
            if request.user.role == 'AMC':
                # If AMC, skip payment and go directly to success
                return redirect('request_successful')
            else:
                # If regular customer, go to the payment page
                return redirect('service_payment_page', request_id=service_request.id)
    else:
        form = ServiceRequestForm(user=request.user, category=category)

    return render(request, 'services/create_request.html', {'form': form, 'category': category})

@login_required
def service_payment_page(request, request_id):
    service_request = get_object_or_404(ServiceRequest, id=request_id, customer=request.user)
    # You can set the fee here or get it from the model/settings
    fee = 500
    context = {
        'service_request': service_request,
        'fee': fee,
    }
    return render(request, 'services/service_payment_page.html', context)

@login_required
def confirm_service_request(request, request_id):
    service_request = get_object_or_404(ServiceRequest, id=request_id, customer=request.user)
    # Here you would normally confirm payment status
    # For now, we just mark it as submitted
    service_request.status = 'SUBMITTED'
    service_request.save()
    return redirect('request_successful')

@login_required
def rate_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    # Ensure the order is delivered and has a technician assigned
    if order.status != 'DELIVERED' or not order.technician:
        return redirect('my_orders')

    if request.method == 'POST':
        form = RatingForm(request.POST)
        if form.is_valid():
            rating = form.save(commit=False)
            rating.customer = request.user
            rating.technician = order.technician
            rating.order = order
            rating.save()
            return redirect('my_orders')
    else:
        form = RatingForm()

    context = {
        'form': form,
        'order': order
    }
    return render(request, 'services/rate_technician.html', context)

@login_required
def update_service_status(request, request_id):
    if request.method == 'POST':
        # Security check: ensure the current user is the assigned technician
        service_request = get_object_or_404(ServiceRequest, id=request_id, technician=request.user)
        service_request.status = 'COMPLETED'
        service_request.save()
    # Redirect back to the dashboard
    return redirect('technician_dashboard')

class ServiceCategoryListAPIView(APIView):
    """
    API view to list all service categories and their nested issues.
    """
    def get(self, request, format=None):
        categories = ServiceCategory.objects.all()
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data)

class ServiceRequestCreateAPIView(generics.CreateAPIView):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated] # Only logged-in users can create

    def perform_create(self, serializer):
        # Automatically assign the logged-in user as the customer
        serializer.save(customer=self.request.user)
