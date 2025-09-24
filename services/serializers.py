# services/serializers.py
from rest_framework import serializers
from .models import ServiceCategory, ServiceIssue, ServiceRequest

class ServiceIssueSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceIssue
        fields = ['id', 'description', 'price']

class ServiceCategorySerializer(serializers.ModelSerializer):
    # This nests the list of issues inside each category
    issues = ServiceIssueSerializer(many=True, read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ['id', 'name', 'issues']

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
