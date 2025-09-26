# store/serializers.py
from rest_framework import serializers
from .models import Product, ProductCategory, Address 

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