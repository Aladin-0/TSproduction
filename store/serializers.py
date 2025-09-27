# store/serializers.py - Updated with enhanced product support
from rest_framework import serializers
from .models import Product, ProductCategory, ProductImage, ProductSpecification, Address, Order, OrderItem

class ProductCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductCategory
        fields = ['id', 'name', 'slug']

class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ['id', 'image', 'alt_text', 'is_primary', 'order']

class ProductSpecificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductSpecification
        fields = ['id', 'name', 'value', 'order']

class ProductSerializer(serializers.ModelSerializer):
    # To show the category name instead of just its ID
    category = ProductCategorySerializer(read_only=True)
    additional_images = ProductImageSerializer(many=True, read_only=True)
    specifications = ProductSpecificationSerializer(many=True, read_only=True)
    features_list = serializers.SerializerMethodField()
    all_images = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', 'name', 'slug', 'description', 'price', 'image', 'category', 
            'stock', 'delivery_time_info', 'brand', 'model_number', 'weight', 
            'dimensions', 'warranty_period', 'features', 'features_list', 
            'is_featured', 'is_active', 'additional_images', 'specifications',
            'all_images', 'created_at', 'updated_at'
        ]

    def get_features_list(self, obj):
        return obj.get_features_list()
    
    def get_all_images(self, obj):
        return obj.all_images

class ProductDetailSerializer(ProductSerializer):
    """Extended serializer for product detail view with all related data"""
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        # Add computed fields for frontend
        data['specifications_dict'] = {
            spec['name']: spec['value'] 
            for spec in data.get('specifications', [])
        }
        
        # Add default specifications if none exist
        if not data['specifications_dict']:
            data['specifications_dict'] = {
                'Brand': data.get('brand', 'TechVerse'),
                'Model': data.get('model_number', data.get('name', '')),
                'Warranty': data.get('warranty_period', '1 Year'),
                'Stock': str(data.get('stock', 0)) + ' units'
            }
        
        # Add default features if none exist
        if not data['features_list']:
            data['features_list'] = [
                'High Quality Materials',
                'Expert Installation Available',
                f"{data.get('warranty_period', '1 Year')} Warranty",
                '24/7 Customer Support'
            ]
        
        return data

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
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    customer_phone = serializers.CharField(source='customer.phone', read_only=True)
    customer_email = serializers.CharField(source='customer.email', read_only=True)
    can_rate = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_date', 'status', 'total_amount',
            'items', 'shipping_address_details', 'technician_name', 
            'technician_phone', 'customer_name', 'customer_phone', 
            'customer_email', 'can_rate'
        ]
    
    def get_can_rate(self, obj):
        # User can rate if order is delivered and no rating exists yet
        return (
            obj.status == 'DELIVERED' and 
            not hasattr(obj, 'rating')
        )