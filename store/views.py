# store/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Product, Order, OrderItem, Address
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ProductSerializer
from rest_framework import generics, permissions # Add generics and permissions
from .serializers import ProductSerializer, AddressSerializer # Add AddressSerializer
from .models import Address

def product_list(request):
    products = Product.objects.all()
    context = {
        'products': products
    }
    return render(request, 'store/product_list.html', context)

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug)
    context = {
        'product': product
    }
    return render(request, 'store/product_detail.html', context)

@login_required
def buy_now(request, slug):
    product = get_object_or_404(Product, slug=slug)
    
    order = Order.objects.create(customer=request.user, status='PENDING')
    
    order_item = OrderItem.objects.create(
        order=order,
        product=product,
        quantity=1,
        price=product.price
    )
    
    return redirect('select_address', order_id=order.id)

@login_required
def select_address(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    addresses = Address.objects.filter(user=request.user)

    if request.method == 'POST':
        address_id = request.POST.get('address')
        if address_id:
            selected_address = get_object_or_404(Address, id=address_id, user=request.user)
            order.shipping_address = selected_address
            order.save()
            return redirect('payment_page', order_id=order.id)

    context = {
        'order': order,
        'addresses': addresses
    }
    return render(request, 'store/select_address.html', context)

@login_required
def payment_page(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    context = {
        'order': order
    }
    return render(request, 'store/payment_page.html', context)

# NEW VIEW TO SIMULATE PAYMENT
@login_required
def confirm_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    # Change the order status to 'PROCESSING' to simulate a successful payment
    order.status = 'PROCESSING'
    order.save()
    return redirect('order_successful', order_id=order.id)

# NEW VIEW FOR THE "THANK YOU" PAGE
@login_required
def order_successful(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    context = {
        'order': order
    }
    return render(request, 'store/order_successful.html', context)

@login_required
def update_order_status(request, order_id):
    if request.method == 'POST':
        # Security check: ensure the current user is the assigned technician
        order = get_object_or_404(Order, id=order_id, technician=request.user)
        order.status = 'DELIVERED'
        order.save()
    # Redirect back to the dashboard
    return redirect('technician_dashboard')

class ProductListAPIView(APIView):
    """
    API view to list all products.
    """
    def get(self, request, format=None):
        products = Product.objects.all()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class AddressListAPIView(generics.ListAPIView):
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Return only the addresses for the currently logged-in user
        return Address.objects.filter(user=self.request.user)

class AddressCreateAPIView(generics.CreateAPIView):
    queryset = Address.objects.all()
    serializer_class = AddressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        # Automatically assign the logged-in user to the new address
        serializer.save(user=self.request.user)
