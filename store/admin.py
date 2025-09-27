# store/admin.py - Updated with ProductImage and ProductSpecification support

from django.contrib import admin
from django.utils.html import format_html
from .models import Address, ProductCategory, Product, ProductImage, ProductSpecification, Order, OrderItem

# To show order items within the order detail page in admin
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    readonly_fields = ('product', 'quantity', 'price')
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'customer', 'order_date', 'status', 'total_amount', 'technician')
    list_filter = ('status', 'order_date', 'technician')
    search_fields = ('customer__name', 'id')
    inlines = [OrderItemInline]

    # ADD THIS FIELDSETS SECTION TO MAKE THE TECHNICIAN FIELD EDITABLE
    fieldsets = (
        (None, {
            'fields': ('customer', 'status', 'shipping_address')
        }),
        ('Job Assignment', {
            'fields': ('technician',)
        }),
    )

class ProductCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

# Inline for additional product images
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order')
    ordering = ['order']

# Inline for product specifications
class ProductSpecificationInline(admin.TabularInline):
    model = ProductSpecification
    extra = 1
    fields = ('name', 'value', 'order')
    ordering = ['order']

# Enhanced Product admin
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'brand', 'price', 'stock', 'is_featured', 'is_active', 'image_preview')
    list_filter = ('category', 'brand', 'is_featured', 'is_active', 'created_at')
    search_fields = ('name', 'description', 'brand', 'model_number')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'image_preview')
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'brand', 'model_number')
        }),
        ('Description & Media', {
            'fields': ('description', 'image', 'image_preview', 'features')
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
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = "Image Preview"
    
    # Custom actions
    actions = ['mark_as_featured', 'mark_as_not_featured', 'mark_as_active', 'mark_as_inactive']
    
    def mark_as_featured(self, request, queryset):
        updated = queryset.update(is_featured=True)
        self.message_user(request, f'{updated} products marked as featured.')
    mark_as_featured.short_description = "Mark selected products as featured"
    
    def mark_as_not_featured(self, request, queryset):
        updated = queryset.update(is_featured=False)
        self.message_user(request, f'{updated} products unmarked as featured.')
    mark_as_not_featured.short_description = "Unmark selected products as featured"
    
    def mark_as_active(self, request, queryset):
        updated = queryset.update(is_active=True)
        self.message_user(request, f'{updated} products marked as active.')
    mark_as_active.short_description = "Mark selected products as active"
    
    def mark_as_inactive(self, request, queryset):
        updated = queryset.update(is_active=False)
        self.message_user(request, f'{updated} products marked as inactive.')
    mark_as_inactive.short_description = "Mark selected products as inactive"

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