# store/admin.py - Fixed complete file

from django.contrib import admin
from django.utils.html import format_html
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from .models import Address, ProductCategory, Product, ProductImage, ProductSpecification, Order, OrderItem

User = get_user_model()

# To show order items within the order detail page in admin
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('get_total_item_price',)
    
    def get_total_item_price(self, obj):
        return f"₹{obj.get_total_item_price()}"
    get_total_item_price.short_description = "Total Price"

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer_name', 'order_date', 'status', 'total_amount', 'technician_name', 'assignment_status')
    list_filter = ('status', 'order_date', 'technician')
    search_fields = ('customer__name', 'customer__email', 'id')
    inlines = [OrderItemInline]
    
    # Enhanced fieldsets with better organization
    fieldsets = (
        ('Order Information', {
            'fields': ('customer', 'order_date', 'shipping_address'),
            'classes': ('wide',)
        }),
        ('Order Status', {
            'fields': ('status',),
            'classes': ('wide',)
        }),
        ('Technician Assignment', {
            'fields': ('technician',),
            'classes': ('wide',),
            'description': 'Assign a technician to handle this order delivery/installation'
        }),
    )
    
    readonly_fields = ('order_date',)
    
    def customer_name(self, obj):
        return obj.customer.name if obj.customer else 'N/A'
    customer_name.short_description = 'Customer'
    customer_name.admin_order_field = 'customer__name'
    
    def technician_name(self, obj):
        if obj.technician:
            return format_html(
                '<span style="color: #28a745; font-weight: bold;">{}</span>',
                obj.technician.name
            )
        return format_html('<span style="color: #dc3545;">Not Assigned</span>')
    technician_name.short_description = 'Assigned Technician'
    technician_name.admin_order_field = 'technician__name'
    
    def assignment_status(self, obj):
        if obj.technician:
            if obj.status == 'DELIVERED':
                return format_html(
                    '<span style="background: #d4edda; color: #155724; padding: 2px 6px; border-radius: 3px; font-size: 11px;">✓ Completed</span>'
                )
            else:
                return format_html(
                    '<span style="background: #d1ecf1; color: #0c5460; padding: 2px 6px; border-radius: 3px; font-size: 11px;">⏳ In Progress</span>'
                )
        return format_html(
            '<span style="background: #f8d7da; color: #721c24; padding: 2px 6px; border-radius: 3px; font-size: 11px;">⚠ Needs Assignment</span>'
        )
    assignment_status.short_description = 'Assignment Status'
    
    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "technician":
            # Only show users with TECHNICIAN role
            kwargs["queryset"] = User.objects.filter(role='TECHNICIAN')
            kwargs["empty_label"] = "Select Technician..."
        return super().formfield_for_foreignkey(db_field, request, **kwargs)
    
    def save_model(self, request, obj, form, change):
        if change and 'technician' in form.changed_data:
            # If technician was assigned, update status to PROCESSING if still PENDING
            if obj.technician and obj.status == 'PENDING':
                obj.status = 'PROCESSING'
        super().save_model(request, obj, form, change)

class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

# Inline for additional product images
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order', 'image_preview')
    readonly_fields = ('image_preview',)
    ordering = ['order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = "Preview"

# Inline for product specifications
class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1
    fields = ('name', 'value', 'order')
    ordering = ['order']

# Enhanced Product admin
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'stock', 'is_featured', 'is_active', 'main_image_preview')
    list_filter = ('category', 'brand', 'is_featured', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'brand', 'model_number')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'main_image_preview')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'brand', 'model_number')
        }),
        ('Description & Media', {
            'fields': ('description', 'image', 'main_image_preview', 'features')
        }),
        ('Pricing & Inventory', {
            'fields': ('price', 'stock', 'delivery_time_info')
        }),
        ('Product Details', {
            'fields': ('weight', 'dimensions', 'warranty_period')
        }),
        ('SEO & Visibility', {
            'fields': ('meta_description', 'is_featured', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    inlines = [ProductImageInline, ProductSpecificationInline]
    
    def main_image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />',
                obj.image.url
            )
        return "No image"
    main_image_preview.short_description = "Main Image Preview"

class ProductImageAdmin(admin.ModelAdmin):
    list_display = ('product', 'alt_text', 'is_primary', 'order', 'image_preview')
    list_filter = ('is_primary', 'product__category')
    search_fields = ('product__name', 'alt_text')
    ordering = ['product', 'order']
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = "Preview"

class ProductSpecificationAdmin(admin.ModelAdmin):
    list_display = ('product', 'name', 'value', 'order')
    list_filter = ('name', 'product__category')
    search_fields = ('product__name', 'name', 'value')
    ordering = ['product', 'order']

# Register your models here
admin.site.register(Address)
admin.site.register(ProductCategory, ProductCategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(ProductImage, ProductImageAdmin)
admin.site.register(ProductSpecification, ProductSpecificationAdmin)
admin.site.register(Order, OrderAdmin)