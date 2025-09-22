# store/admin.py

from django.contrib import admin
from .models import Address, ProductCategory, Product, Order, OrderItem

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

# Customization for the Product admin
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'stock')
    list_filter = ('category',)
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}

# Register your models here
admin.site.register(Address)
admin.site.register(ProductCategory, ProductCategoryAdmin)
admin.site.register(Product, ProductAdmin)
admin.site.register(Order, OrderAdmin) # <-- Register Order