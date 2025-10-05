# store/views.py - Updated with ProductDetailAPIView

from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth.decorators import login_required
from .models import Product, Order, OrderItem, Address
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import (
    ProductSerializer, ProductDetailSerializer, AddressSerializer, 
    AddressCreateUpdateSerializer, OrderSerializer
)
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.contrib.admin.views.decorators import staff_member_required
from django.views.decorators.csrf import csrf_exempt
import os
from services.models import ServiceRequest

def product_list(request):
    products = Product.objects.filter(is_active=True)
    context = {
        'products': products
    }
    return render(request, 'store/product_list.html', context)

def product_detail(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    context = {
        'product': product
    }
    return render(request, 'store/product_detail.html', context)

@login_required
def buy_now(request, slug):
    product = get_object_or_404(Product, slug=slug, is_active=True)
    
    # Check stock
    if product.stock <= 0:
        return redirect('product_detail', slug=slug)
    
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
    
    # Reduce stock for each item
    for item in order.items.all():
        if item.product.stock >= item.quantity:
            item.product.stock -= item.quantity
            item.product.save()
        else:
            # Handle insufficient stock
            return redirect('payment_page', order_id=order.id)
    
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

# API Views
class ProductListAPIView(APIView):
    """
    API view to list all active products.
    """
    permission_classes = [permissions.AllowAny]
    def get(self, request, format=None):
        products = Product.objects.filter(is_active=True).select_related('category').prefetch_related('additional_images', 'specifications')
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductDetailAPIView(generics.RetrieveAPIView):
    """
    API view to get detailed product information by slug.
    """
    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('additional_images', 'specifications')
    
    def get_object(self):
        slug = self.kwargs.get('slug')
        try:
            return self.get_queryset().get(slug=slug)
        except Product.DoesNotExist:
            from django.http import Http404
            raise Http404("Product not found")

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
        product = get_object_or_404(Product, slug=product_slug, is_active=True)
        address = get_object_or_404(Address, id=address_id, user=request.user)
        
        # Check stock
        if product.stock < quantity:
            return Response(
                {'error': f'Only {product.stock} items available in stock'}, 
                status=400
            )
        
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
        
        # Don't reduce stock until order is confirmed
        
        # Serialize and return
        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_bulk_order(request):
    """
    Create a single order that aggregates multiple cart items.
    Expected payload: { address_id: number, items: [{ product_slug, quantity }] }
    """
    try:
        address_id = request.data.get('address_id')
        items = request.data.get('items', [])

        if not address_id or not items:
            return Response({'error': 'Items and address are required'}, status=400)

        # Validate address
        address = get_object_or_404(Address, id=address_id, user=request.user)

        # Validate stock for all items first to avoid partial orders
        validated_items = []
        for raw in items:
            product_slug = raw.get('product_slug')
            quantity = int(raw.get('quantity', 1))
            if not product_slug:
                return Response({'error': 'Each item must include product_slug'}, status=400)

            product = get_object_or_404(Product, slug=product_slug, is_active=True)

            if product.stock < quantity:
                return Response(
                    {'error': f'Only {product.stock} items available in stock for {product.name}'},
                    status=400
                )

            validated_items.append((product, quantity))

        # Create the single order
        order = Order.objects.create(
            customer=request.user,
            status='PENDING',
            shipping_address=address
        )

        # Create order items
        for product, quantity in validated_items:
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=201)

    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def cancel_order(request, order_id):
    """
    Cancel an order (only if pending/processing)
    """
    try:
        order = get_object_or_404(Order, id=order_id, customer=request.user)
        
        if order.status not in ['PENDING', 'PROCESSING']:
            return Response(
                {'error': 'Order cannot be cancelled'}, 
                status=400
            )
        
        # If order was processing, restore stock
        if order.status == 'PROCESSING':
            for item in order.items.all():
                item.product.stock += item.quantity
                item.product.save()
        
        order.status = 'CANCELLED'
        order.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@staff_member_required
@require_http_methods(["POST"])
@csrf_exempt
def delete_product_image(request, image_id):
    try:
        from .models import ProductImage
        image = ProductImage.objects.get(id=image_id)
        
        # Delete the actual file
        if image.image:
            if os.path.isfile(image.image.path):
                os.remove(image.image.path)
        
        # Delete the database record
        image.delete()
        
        return JsonResponse({'success': True})
    except ProductImage.DoesNotExist:
        return JsonResponse({'error': 'Image not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_assigned_services(request):
    """Get services assigned to technician with job sheet status"""
    if request.user.role != 'TECHNICIAN':
        return Response({'error': 'Unauthorized'}, status=403)
    
    from services.models import JobSheet
    
    # Get services with related data
    services = ServiceRequest.objects.filter(
        technician=request.user
    ).select_related(
        'customer', 
        'service_category', 
        'service_location',
        'issue'
    ).prefetch_related('job_sheet')  # This is important!
    
    services_data = []
    for service in services:
        # Try to get the job sheet for this service
        try:
            job_sheet = JobSheet.objects.get(service_request=service)
            has_job_sheet = True
            job_sheet_status = job_sheet.approval_status
            job_sheet_id = job_sheet.id
        except JobSheet.DoesNotExist:
            has_job_sheet = False
            job_sheet_status = None
            job_sheet_id = None
        
        service_data = {
            'id': service.id,
            'customer': {
                'name': service.customer.name,
                'phone': service.customer.phone,
            },
            'service_category': {
                'name': service.service_category.name,
            },
            'issue': {
                'description': service.issue.description
            } if service.issue else None,
            'custom_description': service.custom_description,
            'service_location': {
                'street_address': service.service_location.street_address,
                'city': service.service_location.city,
                'state': service.service_location.state,
                'pincode': service.service_location.pincode,
            },
            'request_date': service.request_date.isoformat(),
            'status': service.status,
            # Job sheet fields - FIXED
            'has_job_sheet': has_job_sheet,
            'job_sheet_status': job_sheet_status,
            'job_sheet_id': job_sheet_id,
        }
        services_data.append(service_data)
    
    return Response(services_data)
    