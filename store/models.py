# store/models.py - Fixed with proper error handling

from django.db import models
from django.conf import settings # To get the CustomUser model
from decimal import Decimal

class Address(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    street_address = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=6)
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name_plural = 'Addresses'

    def __str__(self):
        return f"{self.user.name}'s Address in {self.city}"

class ProductCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, help_text="A unique, URL-friendly name for the category.")

    class Meta:
        verbose_name_plural = 'Product Categories'

    def __str__(self):
        return self.name

class Product(models.Model):
    category = models.ForeignKey(ProductCategory, related_name='products', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, help_text="A unique, URL-friendly name for the product.")
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='products/', help_text="Main product image")  # Main image
    stock = models.PositiveIntegerField(default=0)
    delivery_time_info = models.CharField(max_length=255, help_text="e.g., 'Delivered within 2-3 business days'")
    
    # New fields for enhanced product details
    brand = models.CharField(max_length=100, blank=True, help_text="Product brand name")
    model_number = models.CharField(max_length=100, blank=True, help_text="Product model number")
    weight = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True, help_text="Weight in kg")
    dimensions = models.CharField(max_length=100, blank=True, help_text="L x W x H in cm")
    warranty_period = models.CharField(max_length=50, default="1 Year", help_text="Warranty period")
    features = models.TextField(blank=True, help_text="Comma-separated list of key features")
    
    # SEO and metadata
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO meta description")
    is_featured = models.BooleanField(default=False, help_text="Mark as featured product")
    is_active = models.BooleanField(default=True, help_text="Product is active and visible")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
    
    def get_features_list(self):
        """Return features as a list"""
        if self.features:
            return [feature.strip() for feature in self.features.split(',') if feature.strip()]
        return []
    
    @property
    def main_image_url(self):
        """Get the main image URL"""
        if self.image:
            return self.image.url
        return None
    
    @property
    def all_images(self):
        """Get all images including main image and additional images - FIXED to avoid duplicates"""
        images = []
        seen_urls = set()
        
        # Add main image first if it exists
        if self.image:
            main_url = self.image.url
            images.append(main_url)
            seen_urls.add(main_url)
        
        # Add additional images, avoiding duplicates
        additional_images = self.additional_images.all().order_by('order', 'id')
        for img_obj in additional_images:
            if img_obj.image:
                img_url = img_obj.image.url
                if img_url not in seen_urls:
                    images.append(img_url)
                    seen_urls.add(img_url)
        
        return images

class ProductImage(models.Model):
    """Additional images for products"""
    product = models.ForeignKey(Product, related_name='additional_images', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='products/additional/')
    alt_text = models.CharField(max_length=255, blank=True, help_text="Alternative text for the image")
    is_primary = models.BooleanField(default=False, help_text="Set as primary image")
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    
    class Meta:
        ordering = ['order', 'id']
        verbose_name = 'Product Image'
        verbose_name_plural = 'Product Images'
    
    def __str__(self):
        return f"{self.product.name} - Image {self.order}"
    
    def save(self, *args, **kwargs):
        """Override save to ensure only one primary image per product"""
        if self.is_primary:
            # Set all other images for this product to not primary
            ProductImage.objects.filter(
                product=self.product, 
                is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)
    
    def delete(self, *args, **kwargs):
        """Override delete to remove image file from filesystem"""
        if self.image:
            try:
                import os
                if os.path.isfile(self.image.path):
                    os.remove(self.image.path)
            except (ValueError, OSError):
                pass  # Handle cases where file doesn't exist
        super().delete(*args, **kwargs)

class ProductSpecification(models.Model):
    """Technical specifications for products"""
    product = models.ForeignKey(Product, related_name='specifications', on_delete=models.CASCADE)
    name = models.CharField(max_length=100, help_text="Specification name (e.g., 'Processor', 'RAM')")
    value = models.CharField(max_length=255, help_text="Specification value")
    order = models.PositiveIntegerField(default=0, help_text="Display order")
    
    class Meta:
        ordering = ['order', 'name']
        unique_together = ['product', 'name']
    
    def __str__(self):
        return f"{self.product.name} - {self.name}: {self.value}"

class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('PROCESSING', 'Processing'),
        ('SHIPPED', 'Shipped'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True)
    # MAKE SURE THIS FIELD EXISTS
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_orders', limit_choices_to={'role': 'TECHNICIAN'})
    order_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    shipping_address = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"Order #{self.id} by {self.customer.name if self.customer else 'Guest'}"

    @property
    def total_amount(self):
        """Calculate total amount with proper error handling"""
        try:
            total = Decimal('0.00')
            for item in self.items.all():
                item_total = item.get_total_item_price()
                if item_total is not None:
                    total += item_total
            return total
        except Exception as e:
            print(f"Error calculating total amount for order {self.id}: {e}")
            return Decimal('0.00')

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True) # Price at time of order

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"

    def get_total_item_price(self):
        """Calculate total item price with proper error handling"""
        try:
            # Use the stored price from order time, fallback to current product price
            item_price = self.price
            if item_price is None:
                if self.product and self.product.price:
                    item_price = self.product.price
                    # Update the stored price for future reference
                    self.price = item_price
                    self.save(update_fields=['price'])
                else:
                    print(f"Warning: No price found for OrderItem {self.id} (Product: {self.product})")
                    return Decimal('0.00')
            
            if self.quantity and item_price:
                return Decimal(str(self.quantity)) * Decimal(str(item_price))
            else:
                print(f"Warning: Invalid quantity ({self.quantity}) or price ({item_price}) for OrderItem {self.id}")
                return Decimal('0.00')
                
        except Exception as e:
            print(f"Error calculating total for OrderItem {self.id}: {e}")
            return Decimal('0.00')
    
    def save(self, *args, **kwargs):
        """Override save to ensure price is set"""
        if self.price is None and self.product:
            self.price = self.product.price
        super().save(*args, **kwargs)