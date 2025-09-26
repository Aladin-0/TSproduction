# store/serializers.py
from rest_framework import serializers
from .models import Product, ProductCategory, Address 
from rest_framework import serializers
from .models import Order, OrderItem

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug']

class ProductSerializer(serializers.ModelSerializer):
    # To show the category name instead of just its ID
    category = ProductCategorySerializer(read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'slug', 'description', 'price', 'image', 'category']

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id', 'street_address', 'city', 'state', 'pincode', 'is_default']

class AddressCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['street_address', 'city', 'state', 'pincode', 'is_default']
    
    def create(self, validated_data):
        # If this address is being set as default, remove default from others
        if validated_data.get('is_default', False):
            Address.objects.filter(
                user=self.context['request'].user, 
                is_default=True
            ).update(is_default=False)
        
        return Address.objects.create(
            user=self.context['request'].user,
            **validated_data
        )
    
    def update(self, instance, validated_data):
        # If this address is being set as default, remove default from others
        if validated_data.get('is_default', False):
            Address.objects.filter(
                user=instance.user, 
                is_default=True
            ).exclude(id=instance.id).update(is_default=False)
        
        return super().update(instance, validated_data)

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image.url', read_only=True)
    
    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'product_image', 'quantity', 'price']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    shipping_address_details = AddressSerializer(source='shipping_address', read_only=True)
    technician_name = serializers.CharField(source='technician.name', read_only=True)
    technician_phone = serializers.CharField(source='technician.phone', read_only=True)
    can_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_date', 'status', 'total_amount',
            'items', 'shipping_address_details', 'technician_name', 
            'technician_phone', 'can_rate'
        ]
    
    def get_can_rate(self, obj):
        # User can rate if order is delivered and no rating exists yet
        return (
            obj.status == 'DELIVERED' and 
            not hasattr(obj, 'rating')
        )

