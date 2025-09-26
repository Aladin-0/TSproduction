# store/views.py

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Product, Order, OrderItem, Address
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import ProductSerializer, AddressSerializer, AddressCreateUpdateSerializer
from rest_framework import generics, permissions, status
from .models import Address
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from .models import Order
from .serializers import OrderSerializer

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

class UserOrdersListView(generics.ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(
            customer=self.request.user
        ).select_related(
            'shipping_address', 'technician'
        ).prefetch_related(
            'items__product'
        ).order_by('-order_date')

class OrderDetailView(generics.RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Order.objects.filter(customer=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_order(request):
    """
    Create a new order from cart/buy-now
    """
    try:
        # Get data from request
        product_slug = request.data.get('product_slug')
        quantity = request.data.get('quantity', 1)
        address_id = request.data.get('address_id')
        
        if not all([product_slug, address_id]):
            return Response(
                {'error': 'Product and address are required'}, 
                status=400
            )
        
        # Get product and address
        from .models import Product, Address
        product = Product.objects.get(slug=product_slug)
        address = Address.objects.get(id=address_id, user=request.user)
        
        # Create order
        order = Order.objects.create(
            customer=request.user,
            status='PENDING',
            shipping_address=address
        )
        
        # Create order item
        OrderItem.objects.create(
            order=order,
            product=product,
            quantity=quantity,
            price=product.price
        )
        
        # Serialize and return
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)
        
    except Product.DoesNotExist:
        return Response({'error': 'Product not found'}, status=404)
    except Address.DoesNotExist:
        return Response({'error': 'Address not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    """
    Cancel an order (only if pending/processing)
    """
    try:
        order = Order.objects.get(id=order_id, customer=request.user)
        
        if order.status not in ['PENDING', 'PROCESSING']:
            return Response(
                {'error': 'Order cannot be cancelled'}, 
                status=400
            )
        
        order.status = 'CANCELLED'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
        
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=500)
