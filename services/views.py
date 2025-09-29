# services/views.py - Complete file with rating functions

from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import ServiceCategory, ServiceRequest, TechnicianRating
from .forms import ServiceRequestForm, RatingForm
from store.models import Order
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from .serializers import ServiceCategorySerializer, ServiceRequestSerializer, ServiceRequestHistorySerializer

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
def request_successful(request):
    return render(request, 'services/request_successful.html')

@login_required
def service_payment_page(request, request_id):
    service_request = get_object_or_404(ServiceRequest, id=request_id, customer=request.user)
    fee = 500
    context = {
        'service_request': service_request,
        'fee': fee,
    }
    return render(request, 'services/service_payment_page.html', context)

@login_required
def confirm_service_request(request, request_id):
    service_request = get_object_or_404(ServiceRequest, id=request_id, customer=request.user)
    service_request.status = 'SUBMITTED'
    service_request.save()
    return redirect('request_successful')

@login_required
def rate_order(request, order_id):
    order = get_object_or_404(Order, id=order_id, customer=request.user)
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
        service_request = get_object_or_404(ServiceRequest, id=request_id, technician=request.user)
        service_request.status = 'COMPLETED'
        service_request.save()
    return redirect('technician_dashboard')

# API Views
class ServiceCategoryListAPIView(APIView):
    """
    API view to list all service categories and their nested issues.
    """
    permission_classes = [permissions.AllowAny]
    def get(self, request, format=None):
        categories = ServiceCategory.objects.all()
        serializer = ServiceCategorySerializer(categories, many=True)
        return Response(serializer.data)

class ServiceRequestCreateAPIView(generics.CreateAPIView):
    queryset = ServiceRequest.objects.all()
    serializer_class = ServiceRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)


class ServiceRequestHistoryAPIView(generics.ListAPIView):
    """
    API view to list the current user's service requests (history).
    Includes technician info and whether the request can be rated.
    """
    serializer_class = ServiceRequestHistorySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ServiceRequest.objects.filter(customer=self.request.user).order_by('-request_date')

# Rating API Views
@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_rating(request):
    """
    Create a rating for a technician based on order or service request
    """
    try:
        data = request.data
        rating_value = data.get('rating')
        comment = data.get('comment', '')
        order_id = data.get('order_id')
        service_request_id = data.get('service_request_id')
        
        print(f"Rating submission attempt by user {request.user.id}")
        print(f"Data received: {data}")
        
        # Validation
        if not rating_value or rating_value not in [1, 2, 3, 4, 5]:
            return Response(
                {'error': 'Valid rating (1-5) is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not order_id and not service_request_id:
            return Response(
                {'error': 'Either order_id or service_request_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if order_id and service_request_id:
            return Response(
                {'error': 'Cannot rate both order and service request at the same time'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Handle order rating
        if order_id:
            try:
                order = Order.objects.get(id=order_id, customer=request.user)
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found or you do not have permission to rate it'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not order.technician:
                return Response(
                    {'error': 'No technician assigned to this order'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if order.status != 'DELIVERED':
                return Response(
                    {'error': 'Can only rate delivered orders'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if already rated
            if TechnicianRating.objects.filter(order=order, customer=request.user).exists():
                return Response(
                    {'error': 'You have already rated this order'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create rating
            rating = TechnicianRating.objects.create(
                technician=order.technician,
                customer=request.user,
                order=order,
                rating=rating_value,
                comment=comment
            )
            
            print(f"Rating created successfully: {rating.id}")
            
            return Response({
                'message': 'Rating submitted successfully',
                'rating': {
                    'id': rating.id,
                    'rating': rating.rating,
                    'comment': rating.comment,
                    'technician_name': rating.technician.name,
                    'created_at': rating.created_at
                }
            }, status=status.HTTP_201_CREATED)
        
        # Handle service request rating
        if service_request_id:
            try:
                service_request = ServiceRequest.objects.get(
                    id=service_request_id, 
                    customer=request.user
                )
            except ServiceRequest.DoesNotExist:
                return Response(
                    {'error': 'Service request not found or you do not have permission to rate it'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
            
            if not service_request.technician:
                return Response(
                    {'error': 'No technician assigned to this service request'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if service_request.status != 'COMPLETED':
                return Response(
                    {'error': 'Can only rate completed service requests'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if already rated
            if TechnicianRating.objects.filter(
                service_request=service_request, 
                customer=request.user
            ).exists():
                return Response(
                    {'error': 'You have already rated this service request'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create rating
            rating = TechnicianRating.objects.create(
                technician=service_request.technician,
                customer=request.user,
                service_request=service_request,
                rating=rating_value,
                comment=comment
            )
            
            print(f"Service rating created successfully: {rating.id}")
            
            return Response({
                'message': 'Rating submitted successfully',
                'rating': {
                    'id': rating.id,
                    'rating': rating.rating,
                    'comment': rating.comment,
                    'technician_name': rating.technician.name,
                    'created_at': rating.created_at
                }
            }, status=status.HTTP_201_CREATED)
            
    except Exception as e:
        print(f"Error in create_rating: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_ratings(request):
    """
    Get all ratings submitted by the current user
    """
    try:
        ratings = TechnicianRating.objects.filter(customer=request.user).order_by('-created_at')
        
        ratings_data = []
        for rating in ratings:
            rating_data = {
                'id': rating.id,
                'rating': rating.rating,
                'comment': rating.comment,
                'technician_name': rating.technician.name,
                'created_at': rating.created_at,
                'type': 'order' if rating.order else 'service',
            }
            
            if rating.order:
                rating_data['order_id'] = rating.order.id
                rating_data['order_total'] = str(rating.order.total_amount)
            
            if rating.service_request:
                rating_data['service_request_id'] = rating.service_request.id
                rating_data['service_category'] = rating.service_request.service_category.name
            
            ratings_data.append(rating_data)
        
        return Response({
            'ratings': ratings_data,
            'count': len(ratings_data)
        })
        
    except Exception as e:
        print(f"Error in get_user_ratings: {str(e)}")
        return Response(
            {'error': f'An error occurred: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST'])
@permission_classes([permissions.IsAuthenticated])
def test_rating_endpoint(request):
    """
    Test endpoint to check if rating API is working
    """
    if request.method == 'GET':
        return Response({
            'message': 'Rating endpoint is working!',
            'user': request.user.email,
            'user_id': request.user.id,
            'is_authenticated': request.user.is_authenticated,
        })
    
    if request.method == 'POST':
        return Response({
            'message': 'POST request received',
            'data': request.data,
            'user': request.user.email,
        })
