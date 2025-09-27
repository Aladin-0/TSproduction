# store/models.py - Updated with multiple images support

from django.db import models
from django.conf import settings # To get the CustomUser model

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
        """Get all images including main image and additional images"""
        images = []
        if self.image:
            images.append(self.image.url)
        images.extend([img.image.url for img in self.additional_images.all()])
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
        return sum(item.get_total_item_price() for item in self.items.all())

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Price at time of order

    def __str__(self):
        return f"{self.quantity} of {self.product.name}"

    def get_total_item_price(self):
        return self.quantity * self.price