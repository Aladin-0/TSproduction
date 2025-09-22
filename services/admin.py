# services/admin.py

from django.contrib import admin
from .models import ServiceCategory, ServiceIssue, ServiceRequest, TechnicianRating

class ServiceIssueInline(admin.TabularInline):
    model = ServiceIssue
    extra = 1

class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    inlines = [ServiceIssueInline]

class ServiceRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'service_category', 'status', 'request_date', 'technician')
    list_filter = ('status', 'request_date', 'service_category', 'technician')
    search_fields = ('id', 'customer__name', 'custom_description')

    # ADD THIS FIELDSETS SECTION
    fieldsets = (
        (None, {
            'fields': ('customer', 'status', 'service_category', 'issue', 'custom_description', 'service_location')
        }),
        ('Job Assignment', {
            'fields': ('technician',)
        }),
    )

class TechnicianRatingAdmin(admin.ModelAdmin):
    list_display = ('technician', 'customer', 'rating', 'created_at', 'order', 'service_request')
    list_filter = ('technician', 'rating')

admin.site.register(ServiceCategory, ServiceCategoryAdmin)
admin.site.register(ServiceRequest, ServiceRequestAdmin)
admin.site.register(TechnicianRating, TechnicianRatingAdmin)