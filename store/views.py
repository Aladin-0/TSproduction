# store/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Product, Order, OrderItem, Address
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ProductSerializer, AddressSerializer, AddressCreateUpdateSerializer
from rest_framework import generics, permissions, status
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

@login_required
def confirm_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
    order.status = 'PROCESSING'
    order.save()
    return redirect('order_successful', order_id=order.id)

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
        order = get_object_or_404(Order, id=order_id, technician=request.user)
        order.status = 'DELIVERED'
        order.save()
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
        return Address.objects.filter(user=self.request.user)

class AddressCreateAPIView(generics.CreateAPIView):
    queryset = Address.objects.all()
    serializer_class = AddressCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]

class AddressUpdateAPIView(generics.RetrieveUpdateAPIView):
    serializer_class = AddressCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def get_object(self):
        queryset = self.get_queryset()
        address_id = self.kwargs.get('pk')
        return get_object_or_404(queryset, id=address_id)

class AddressDeleteAPIView(generics.DestroyAPIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def get_object(self):
        queryset = self.get_queryset()
        address_id = self.kwargs.get('pk')
        return get_object_or_404(queryset, id=address_id)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Don't allow deletion of default address if it's the only one
        if instance.is_default:
            user_addresses = Address.objects.filter(user=request.user)
            if user_addresses.count() == 1:
                return Response(
                    {'error': 'Cannot delete the only address'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif user_addresses.count() > 1:
                # Set another address as default before deleting
                next_address = user_addresses.exclude(id=instance.id).first()
                next_address.is_default = True
                next_address.save()
        
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)