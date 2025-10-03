# services/serializers.py
from rest_framework import serializers
from .models import ServiceCategory, ServiceIssue, ServiceRequest

class ServiceIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceIssue
        fields = ['id', 'description', 'price']

class ServiceCategorySerializer(serializers.ModelSerializer):
    issues = ServiceIssueSerializer(many=True, read_only=True)  # ← FIXED: Added this line
    is_free_for_user = serializers.SerializerMethodField()
    
    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'issues', 'is_free_for_user']

    def get_is_free_for_user(self, obj):
        """Check if this service category is free for the current user"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            if request.user.role == 'AMC':
                return request.user.has_free_service(obj)
        return False

class ServiceRequestSerializer(serializers.ModelSerializer):
    # We make customer read-only because we'll set it automatically in the view
    customer = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = ServiceRequest
        fields = [
            'id',
            'customer',
            'service_category',
            'issue',
            'custom_description',
            'service_location',
            'status',
        ]

class ServiceRequestHistorySerializer(serializers.ModelSerializer):
    service_category_name = serializers.CharField(source='service_category.name', read_only=True)
    issue_description = serializers.CharField(source='issue.description', read_only=True)
    issue_price = serializers.DecimalField(source='issue.price', max_digits=10, decimal_places=2, read_only=True)
    technician_name = serializers.SerializerMethodField()
    request_date = serializers.DateTimeField(read_only=True)
    can_rate = serializers.SerializerMethodField()
    service_location = serializers.SerializerMethodField()

    class Meta:
        model = ServiceRequest
        fields = [
            'id',
            'service_category_name',
            'issue_description',
            'issue_price',
            'custom_description',
            'service_location',
            'request_date',
            'status',
            'technician_name',
            'can_rate',
        ]

    def get_technician_name(self, obj):
        return obj.technician.name if obj.technician else None

    def get_can_rate(self, obj):
        # Can rate only when completed, has technician, and not already rated
        has_rating = hasattr(obj, 'rating') and obj.rating is not None
        return bool(obj.technician and obj.status == 'COMPLETED' and not has_rating)

    def get_service_location(self, obj):
        loc = obj.service_location
        if not loc:
            return None
        return {
            'street_address': getattr(loc, 'street_address', ''),
            'city': getattr(loc, 'city', ''),
            'state': getattr(loc, 'state', ''),
            'pincode': getattr(loc, 'pincode', ''),
        }