# users/views.py

from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from .forms import CustomerRegistrationForm, AddressForm
from store.models import Order
from services.models import ServiceRequest, TechnicianRating
from django.http import JsonResponse
from django.middleware.csrf import get_token 
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from .serializers import UserSerializer, UserProfileUpdateSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

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

def csrf_token_view(request):
    return JsonResponse({'csrfToken': get_token(request)})

class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

class UserProfileUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get current user profile"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        """Update user profile"""
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            serializer.save()
            # Return updated user data
            updated_serializer = UserSerializer(request.user)
            return Response(updated_serializer.data)
        
        return Response(
            serializer.errors, 
            status=status.HTTP_400_BAD_REQUEST
        )

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        """Change user password"""
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')
        
        if not current_password or not new_password:
            return Response(
                {'error': 'Both current and new passwords are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # Check if current password is correct
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate new password (you can add more validation here)
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters long'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Set new password
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})

class DeleteAccountView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def delete(self, request):
        """Delete user account"""
        password = request.data.get('password')
        
        if not password:
            return Response(
                {'error': 'Password is required to delete account'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user = request.user
        
        # Verify password
        if not user.check_password(password):
            return Response(
                {'error': 'Incorrect password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Mark user as inactive instead of deleting (safer approach)
        user.is_active = False
        user.save()
        
        return Response({'message': 'Account deactivated successfully'})

class GoogleLoginJWTView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Generate JWT tokens for authenticated user (from Google login)"""
        user = request.user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data
        })

# Also update the CurrentUserView to handle sessions
class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
class DebugAuthView(APIView):
    """Debug view to check authentication status"""
    permission_classes = []  # Allow all for debugging
    
    def get(self, request):
        return Response({
            'user_authenticated': request.user.is_authenticated,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'user_email': request.user.email if request.user.is_authenticated else None,
            'session_key': request.session.session_key,
            'cookies': dict(request.COOKIES),
            'headers': dict(request.headers),
        })

# Update the GoogleLoginJWTView to be more permissive for debugging
class GoogleLoginJWTView(APIView):
    permission_classes = []  # Temporarily remove auth requirement for debugging
    
    def get(self, request):
        """Generate JWT tokens for authenticated user (from Google login)"""
        # Check if user is authenticated via session
        if not request.user.is_authenticated:
            return Response({
                'error': 'User not authenticated',
                'session_key': request.session.session_key,
                'cookies': dict(request.COOKIES),
            }, status=401)
        
        user = request.user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'debug': {
                'session_key': request.session.session_key,
                'user_id': user.id,
            }
        })
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

User = get_user_model()

@csrf_exempt
@require_http_methods(["POST"])
def create_user_from_google(request):
    """
    Create a user account from Google OAuth data and return JWT tokens
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        name = data.get('name')
        google_id = data.get('google_id')
        
        if not email or not name:
            return JsonResponse({'error': 'Email and name are required'}, status=400)
        
        # Check if user already exists
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'role': 'CUSTOMER'
            }
        )
        
        # If user exists but name is different, update it
        if not created and user.name != name:
            user.name = name
            user.save()
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return JsonResponse({
            'success': True,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'email': user.email,
                'name': user.name,
                'role': user.role,
                'email_notifications': getattr(user, 'email_notifications', True),
                'sms_notifications': getattr(user, 'sms_notifications', True),
            }
        })
        
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
