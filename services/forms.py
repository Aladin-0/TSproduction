# services/forms.py

from django import forms
from .models import ServiceRequest, ServiceIssue
from store.models import Address
from .models import ServiceRequest, ServiceIssue, TechnicianRating

class ServiceRequestForm(forms.ModelForm):
    class Meta:
        model = ServiceRequest
        fields = ['issue', 'custom_description', 'service_location']

    def __init__(self, *args, **kwargs):
        # Get the user and category passed from the view
        user = kwargs.pop('user', None)
        category = kwargs.pop('category', None)
        super().__init__(*args, **kwargs)

        if category:
            # Filter the 'issue' dropdown to only show issues for the current category
            self.fields['issue'].queryset = ServiceIssue.objects.filter(category=category)

        if user:
            # Filter the 'service_location' dropdown to only show addresses for the current user
            self.fields['service_location'].queryset = Address.objects.filter(user=user)

class RatingForm(forms.ModelForm):
    class Meta:
        model = TechnicianRating
        # Only show the fields the customer needs to fill
        fields = ['rating', 'comment']
        widgets = {
            'comment': forms.Textarea(attrs={'rows': 4}),
        }
    