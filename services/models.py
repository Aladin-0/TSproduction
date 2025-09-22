# services/models.py

from django.db import models
from django.conf import settings
from store.models import Address

class ServiceCategory(models.Model):
    name = models.CharField(max_length=255, unique=True)

    class Meta:
        verbose_name_plural = 'Service Categories'

    def __str__(self):
        return self.name

class ServiceIssue(models.Model):
    category = models.ForeignKey(ServiceCategory, related_name='issues', on_delete=models.CASCADE)
    description = models.CharField(max_length=255)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.category.name} - {self.description}"

class ServiceRequest(models.Model):
    STATUS_CHOICES = (
        ('SUBMITTED', 'Submitted'),
        ('ASSIGNED', 'Technician Assigned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    )

    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_services', limit_choices_to={'role': 'TECHNICIAN'})
    service_category = models.ForeignKey(ServiceCategory, on_delete=models.CASCADE)
    issue = models.ForeignKey(ServiceIssue, on_delete=models.SET_NULL, null=True, blank=True)
    custom_description = models.TextField(blank=True, help_text="If your issue isn't listed, describe it here.")
    service_location = models.ForeignKey(Address, on_delete=models.SET_NULL, null=True)
    request_date = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='SUBMITTED')

    def __str__(self):
        return f"Service Request #{self.id} by {self.customer.name}"

class TechnicianRating(models.Model):
    RATING_CHOICES = (
        (1, '1 - Poor'),
        (2, '2 - Fair'),
        (3, '3 - Good'),
        (4, '4 - Very Good'),
        (5, '5 - Excellent'),
    )

    technician = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_received', limit_choices_to={'role': 'TECHNICIAN'})
    customer = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='ratings_given')

    # Link to the job being rated. Can be an Order or a ServiceRequest.
    order = models.OneToOneField('store.Order', on_delete=models.CASCADE, null=True, blank=True, related_name='rating')
    service_request = models.OneToOneField('ServiceRequest', on_delete=models.CASCADE, null=True, blank=True, related_name='rating')

    rating = models.IntegerField(choices=RATING_CHOICES)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Rating for {self.technician.name} by {self.customer.name} - {self.rating} stars"


