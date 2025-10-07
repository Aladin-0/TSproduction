# users/views.py - Enhanced version with proper profile management

from django.shortcuts import render, redirect
from django.contrib.auth import login
from django.contrib.auth.decorators import login_required
from django.db.models import Avg
from django.http import JsonResponse, HttpResponse
from django.middleware.csrf import get_token 
from django.contrib.auth import get_user_model
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework_simplejwt.tokens import RefreshToken
import json
from django.http import HttpResponseRedirect
from django.conf import settings

# Local imports
from .forms import CustomerRegistrationForm, AddressForm
from .serializers import UserSerializer, UserProfileUpdateSerializer
from store.models import Order
from services.models import ServiceRequest, TechnicianRating
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from allauth.socialaccount.providers.google.views import oauth2_login

User = get_user_model()

# Template views
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
    context = {'orders': orders}
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

# API views
def csrf_token_view(request):
    """Return CSRF token and set CSRF cookie for session-auth writes."""
    token = get_token(request)
    response = JsonResponse({'csrfToken': token})
    # Ensure CSRF cookie is set so double-submit check passes
    # Django's default cookie name is 'csrftoken'
    response.set_cookie(
        'csrftoken',
        token,
        samesite='Lax',
        secure=request.is_secure(),
        httponly=False,
    )
    return response

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
        print(f"Received profile update data: {request.data}")
        
        serializer = UserProfileUpdateSerializer(
            request.user, 
            data=request.data, 
            partial=True
        )
        
        if serializer.is_valid():
            user = serializer.save()
            print(f"User updated successfully: {user.name}, {user.phone}")
            
            # Return updated user data
            updated_serializer = UserSerializer(user)
            return Response(updated_serializer.data)
        
        print(f"Serializer errors: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

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
        
        if not user.check_password(current_password):
            return Response(
                {'error': 'Current password is incorrect'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(new_password) < 8:
            return Response(
                {'error': 'New password must be at least 8 characters long'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
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
        
        if not user.check_password(password):
            return Response(
                {'error': 'Incorrect password'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.is_active = False
        user.save()
        
        return Response({'message': 'Account deactivated successfully'})

class ProfileValidationView(APIView):
    """Check if user profile is complete for checkout"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        user = request.user
        missing_fields = []
        
        if not user.name or user.name.strip() == '':
            missing_fields.append('name')
        
        if not user.phone or user.phone.strip() == '':
            missing_fields.append('phone')
        
        # Check if user has at least one address
        from store.models import Address
        addresses = Address.objects.filter(user=user)
        if not addresses.exists():
            missing_fields.append('address')
        
        return Response({
            'is_complete': len(missing_fields) == 0,
            'missing_fields': missing_fields,
            'user': UserSerializer(user).data
        })

@method_decorator(csrf_exempt, name='dispatch')
class GoogleJWTTokenView(APIView):
    """
    Generate JWT tokens for users authenticated via Google OAuth session
    """
    permission_classes = []  # No auth required since we're checking session
    
    def get(self, request):
        print(f"Session authenticated: {request.user.is_authenticated}")
        print(f"User: {request.user}")
        print(f"Session key: {request.session.session_key}")
        print(f"Cookies: {request.COOKIES}")
        
        # Check if user is authenticated via session (from Google OAuth)
        if not request.user.is_authenticated:
            return Response({
                'error': 'User not authenticated via Google OAuth session',
                'debug': {
                    'session_key': request.session.session_key,
                    'user_authenticated': request.user.is_authenticated,
                    'cookies': dict(request.COOKIES),
                }
            }, status=401)
        
        user = request.user
        
        # Generate JWT tokens for the authenticated user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
            'success': True
        })
    
    def options(self, request, *args, **kwargs):
        """Handle preflight CORS requests"""
        response = Response()
        response["Access-Control-Allow-Origin"] = "http://localhost:5173"
        response["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response["Access-Control-Allow-Credentials"] = "true"
        return response

class DebugAuthView(APIView):
    """Debug view to check authentication status"""
    permission_classes = []
    
    def get(self, request):
        return Response({
            'user_authenticated': request.user.is_authenticated,
            'user_id': request.user.id if request.user.is_authenticated else None,
            'user_email': request.user.email if request.user.is_authenticated else None,
            'user_name': getattr(request.user, 'name', None) if request.user.is_authenticated else None,
            'session_key': request.session.session_key,
            'has_jwt_header': 'Authorization' in request.headers,
            'jwt_header': request.headers.get('Authorization', 'None')[:50] if 'Authorization' in request.headers else None,
            'cookies': list(request.COOKIES.keys()),
        })

@csrf_exempt
@require_http_methods(["POST"])
def create_user_from_google(request):
    """Create a user account from Google OAuth data and return JWT tokens"""
    try:
        data = json.loads(request.body)
        email = data.get('email')
        name = data.get('name')
        
        if not email or not name:
            return JsonResponse({'error': 'Email and name are required'}, status=400)
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'name': name,
                'role': 'CUSTOMER'
            }
        )
        
        if not created and user.name != name:
            user.name = name
            user.save()
        
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

@csrf_exempt
def google_login_success(request):
    """
    Endpoint called after successful Google OAuth to generate JWT tokens
    """
    if request.method == 'GET':
        # Check if user is authenticated via session
        if request.user.is_authenticated:
            user = request.user
            
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            
            # Create response with tokens embedded in JavaScript
            response_html = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Login Success</title>
            </head>
            <body>
                <script>
                    // Store tokens in localStorage
                    localStorage.setItem('access_token', '{refresh.access_token}');
                    localStorage.setItem('refresh_token', '{refresh}');
                    
                    // Store user data
                    const userData = {json.dumps({
                        'id': user.id,
                        'email': user.email,
                        'name': user.name,
                        'role': user.role,
                        'email_notifications': user.email_notifications,
                        'sms_notifications': user.sms_notifications,
                    })};
                    
                    // Post message to parent window (React app)
                    if (window.opener) {{
                        window.opener.postMessage({{
                            type: 'GOOGLE_LOGIN_SUCCESS',
                            tokens: {{
                                access: '{refresh.access_token}',
                                refresh: '{refresh}'
                            }},
                            user: userData
                        }}, '*');
                        window.close();
                    }} else {{
                        // Fallback: redirect to React app with success parameter
                        window.location.href = 'http://localhost:5173/?login=success&token=' + encodeURIComponent('{refresh.access_token}');
                    }}
                </script>
                <p>Login successful! Redirecting...</p>
            </body>
            </html>
            """
            return HttpResponse(response_html)
        else:
            return HttpResponse("Not authenticated", status=401)
    
    return HttpResponse("Method not allowed", status=405)


# Redirect Allauth's 3rd-party signup page to our frontend Create Account
def redirect_third_party_signup(request):
    # Include an info flag so the frontend can show a helpful notice
    base = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
    return HttpResponseRedirect(f"{base}/login?tab=signup&info=no_account")

def google_login_redirect(request):
    """
    Directly redirect to Google OAuth without showing intermediate page
    """
    # Directly call the Google OAuth login view
    # This skips the allauth intermediate "Sign in with Google" page
    return oauth2_login(request)


@csrf_exempt
def mobile_google_callback(request):
    """
    Mobile-specific callback that handles state issues
    """
    # Get the state and code from Google
    state = request.GET.get('state')
    code = request.GET.get('code')
    
    if not state or not code:
        return HttpResponseRedirect('http://localhost:5173/login?error=oauth_failed')
    
    # Redirect to the standard allauth callback with proper headers
    callback_url = f"/accounts/google/login/callback/?state={state}&code={code}"
    response = HttpResponseRedirect(callback_url)
    
    # Ensure cookies are set for mobile
    response['Cache-Control'] = 'no-cache, no-store, must-revalidate'
    response['Pragma'] = 'no-cache'
    
    return response
