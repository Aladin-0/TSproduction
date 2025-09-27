# store/admin.py - Updated with ProductImage and ProductSpecification support

from django.contrib import admin
from django.utils.html import format_html
from .models import Address, ProductCategory, Product, ProductImage, ProductSpecification, Order, OrderItem

# To show order items within the order detail page in admin
class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1
    fields = ('image', 'alt_text', 'is_primary', 'order', 'image_preview', 'delete_image')
    readonly_fields = ('image_preview', 'delete_image')
    ordering = ['order']

    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return "No image"
    image_preview.short_description = "Preview"

    def delete_image(self, obj):
        if obj.pk:  # Only show for saved objects
            return format_html(
                '<button type="button" onclick="if(confirm(\'Delete this image?\')) {{ '
                'fetch(\'/admin/delete-product-image/{}/\', {{method: \'POST\', '
                'headers: {{\'X-CSRFToken\': document.querySelector(\'[name=csrfmiddlewaretoken]\').value}}}})'
                '.then(() => location.reload()); }}" '
                'style="background: #dc3545; color: white; border: none; padding: 5px 10px; '
                'border-radius: 3px; cursor: pointer;">Delete</button>'
                , obj.pk
            )
        return "Save to enable deletion"
    delete_image.short_description = "Actions"

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
    
    inlines = [ProductImageInline]
    
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