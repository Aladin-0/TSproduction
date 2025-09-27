# users/forms.py - Fixed version

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from django import forms
from store.models import Address

class CustomUserCreationForm(UserCreationForm):
    """Form for creating users in admin"""
    email = forms.EmailField(required=True, help_text="Required. Enter a valid email address.")
    name = forms.CharField(max_length=255, required=True, help_text="Full name of the user")
    phone = forms.CharField(max_length=15, required=False, help_text="Phone number (optional)")
    
    class Meta:
        model = CustomUser
        fields = ("email", "name", "phone", "role")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # For admin, allow creating all roles except admin
        self.fields['role'].choices = [
            (CustomUser.Role.CUSTOMER, 'Customer'),
            (CustomUser.Role.TECHNICIAN, 'Technician'),
            (CustomUser.Role.AMC, 'AMC'),
        ]
        
        # Make password fields more user-friendly
        self.fields['password1'].help_text = "Enter a strong password for the user"
        self.fields['password2'].help_text = "Enter the same password again for verification"

    def save(self, commit=True):
        user = super().save(commit=False)
        user.email = self.cleaned_data['email']
        user.name = self.cleaned_data['name']
        user.phone = self.cleaned_data.get('phone', '')
        if commit:
            user.save()
        return user

class CustomUserChangeForm(UserChangeForm):
    """Form for editing users in admin"""
    
    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'phone', 'role', 'is_active', 'email_notifications', 'sms_notifications')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Safely remove password field if it exists
        if 'password' in self.fields:
            self.fields.pop('password')

class TechnicianCreationForm(UserCreationForm):
    """Simplified form specifically for creating technicians"""
    email = forms.EmailField(required=True)
    name = forms.CharField(max_length=255, required=True)
    phone = forms.CharField(max_length=15, required=False)
    
    class Meta:
        model = CustomUser
        fields = ("email", "name", "phone")

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = CustomUser.Role.TECHNICIAN
        user.email = self.cleaned_data['email']
        user.name = self.cleaned_data['name']
        user.phone = self.cleaned_data.get('phone', '')
        if commit:
            user.save()
        return user

class CustomerRegistrationForm(UserCreationForm):
    """Form for customer self-registration"""
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('name', 'email')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = CustomUser.Role.CUSTOMER
        if commit:
            user.save()
        return user

class AddressForm(forms.ModelForm):
    """Form for managing user addresses"""
    class Meta:
        model = Address
        fields = ['street_address', 'city', 'state', 'pincode', 'is_default']
        
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Add CSS classes and help text
        self.fields['street_address'].widget.attrs.update({
            'placeholder': 'Enter complete street address',
            'class': 'form-control'
        })
        self.fields['city'].widget.attrs.update({
            'placeholder': 'City name',
            'class': 'form-control'
        })
        self.fields['state'].widget.attrs.update({
            'placeholder': 'State name',
            'class': 'form-control'
        })
        self.fields['pincode'].widget.attrs.update({
            'placeholder': '6-digit pincode',
            'class': 'form-control',
            'maxlength': '6'
        })