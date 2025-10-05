# store/technician_views.py - API views for technician dashboard

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, status
from rest_framework.decorators import api_view, permission_classes
from django.db.models import Avg, Count, Q
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Order, OrderItem
from .serializers import OrderSerializer
from services.models import ServiceRequest, TechnicianRating
from services.serializers import ServiceRequestSerializer

class TechnicianAssignedOrdersView(APIView):
    """Get orders assigned to the technician"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'TECHNICIAN':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        orders = Order.objects.filter(
            technician=request.user
        ).select_related(
            'customer', 'shipping_address'
        ).prefetch_related(
            'items__product'
        ).order_by('-order_date')
        
        # Enhanced serializer data with technician-specific fields
        orders_data = []
        for order in orders:
            order_data = {
                'id': order.id,
                'customer_name': order.customer.name if order.customer else 'Unknown',
                'customer_phone': order.customer.phone if order.customer else 'N/A',
                'customer_email': order.customer.email if order.customer else 'N/A',
                'order_date': order.order_date,
                'status': order.status,
                'total_amount': str(order.total_amount),
                'shipping_address_details': {
                    'street_address': order.shipping_address.street_address if order.shipping_address else '',
                    'city': order.shipping_address.city if order.shipping_address else '',
                    'state': order.shipping_address.state if order.shipping_address else '',
                    'pincode': order.shipping_address.pincode if order.shipping_address else '',
                } if order.shipping_address else None,
                'items': [{
                    'product_name': item.product.name,
                    'quantity': item.quantity,
                    'price': str(item.price)
                } for item in order.items.all()]
            }
            orders_data.append(order_data)
        
        return Response(orders_data)

class TechnicianAssignedServicesView(APIView):
    """Get service requests assigned to the technician"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'TECHNICIAN':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        from services.models import JobSheet
        
        services = ServiceRequest.objects.filter(
            technician=request.user
        ).select_related(
            'customer', 'service_category', 'issue', 'service_location'
        ).order_by('-request_date')
        
        # Enhanced serializer data with job sheet information
        services_data = []
        for service in services:
            # Check for job sheet
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
                    'name': service.customer.name if service.customer else 'Unknown',
                    'phone': service.customer.phone if service.customer else 'N/A',
                    'email': service.customer.email if service.customer else 'N/A',
                },
                'service_category': {
                    'name': service.service_category.name
                },
                'issue': {
                    'description': service.issue.description
                } if service.issue else None,
                'custom_description': service.custom_description,
                'service_location': {
                    'street_address': service.service_location.street_address if service.service_location else '',
                    'city': service.service_location.city if service.service_location else '',
                    'state': service.service_location.state if service.service_location else '',
                    'pincode': service.service_location.pincode if service.service_location else '',
                } if service.service_location else None,
                'request_date': service.request_date,
                'status': service.status,
                # Job sheet fields - NEW
                'has_job_sheet': has_job_sheet,
                'job_sheet_status': job_sheet_status,
                'job_sheet_id': job_sheet_id,
            }
            services_data.append(service_data)
        
        return Response(services_data)

class TechnicianStatsView(APIView):
    """Get technician statistics"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.role != 'TECHNICIAN':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        technician = request.user
        
        # Order stats
        total_orders = Order.objects.filter(technician=technician).count()
        completed_orders = Order.objects.filter(technician=technician, status='DELIVERED').count()
        
        # Service stats
        total_services = ServiceRequest.objects.filter(technician=technician).count()
        completed_services = ServiceRequest.objects.filter(technician=technician, status='COMPLETED').count()
        
        # Rating stats
        ratings = TechnicianRating.objects.filter(technician=technician)
        average_rating = ratings.aggregate(avg_rating=Avg('rating'))['avg_rating'] or 0
        
        # This month completed tasks
        current_month = timezone.now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        this_month_orders = Order.objects.filter(
            technician=technician, 
            status='DELIVERED',
            order_date__gte=current_month
        ).count()
        this_month_services = ServiceRequest.objects.filter(
            technician=technician, 
            status='COMPLETED',
            request_date__gte=current_month
        ).count()
        
        stats = {
            'total_orders': total_orders,
            'completed_orders': completed_orders,
            'total_services': total_services,
            'completed_services': completed_services,
            'average_rating': round(average_rating, 1) if average_rating else 0,
            'this_month_completed': this_month_orders + this_month_services,
        }
        
        return Response(stats)

class CompleteOrderView(APIView):
    """Mark an order as delivered"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, order_id):
        if request.user.role != 'TECHNICIAN':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        try:
            order = Order.objects.get(id=order_id, technician=request.user)
            
            if order.status == 'DELIVERED':
                return Response({'error': 'Order already marked as delivered'}, status=status.HTTP_400_BAD_REQUEST)
            
            order.status = 'DELIVERED'
            order.save()
            
            return Response({'message': 'Order marked as delivered successfully'})
            
        except Order.DoesNotExist:
            return Response({'error': 'Order not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)

class CompleteServiceView(APIView):
    """Mark a service request as completed - requires approved job sheet"""
    permission_classes = [permissions.IsAuthenticated]
    
    def patch(self, request, service_id):
        if request.user.role != 'TECHNICIAN':
            return Response({'error': 'Access denied'}, status=status.HTTP_403_FORBIDDEN)
        
        from services.models import JobSheet
        
        try:
            service = ServiceRequest.objects.get(id=service_id, technician=request.user)
            
            if service.status == 'COMPLETED':
                return Response({'error': 'Service already marked as completed'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Check if job sheet exists
            try:
                job_sheet = JobSheet.objects.get(service_request=service)
            except JobSheet.DoesNotExist:
                return Response(
                    {'error': 'Cannot complete service. Please create a job sheet first.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Check if job sheet is approved
            if job_sheet.approval_status == 'PENDING':
                return Response(
                    {'error': 'Cannot complete service. Job sheet is pending customer approval.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif job_sheet.approval_status == 'DECLINED':
                return Response(
                    {'error': 'Cannot complete service. Job sheet was declined by customer.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            elif job_sheet.approval_status != 'APPROVED':
                return Response(
                    {'error': 'Cannot complete service. Invalid job sheet status.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Job sheet approved - allow completion
            service.status = 'COMPLETED'
            service.save()
            
            return Response({'message': 'Service marked as completed successfully'})
            
        except ServiceRequest.DoesNotExist:
            return Response({'error': 'Service request not found or not assigned to you'}, status=status.HTTP_404_NOT_FOUND)