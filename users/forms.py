# users/forms.py

from django.contrib.auth.forms import UserCreationForm, UserChangeForm
from .models import CustomUser
from django import forms
from store.models import Address

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("email", "name", "role")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Limit the choices for the role field in the admin to only Technician and AMC
        self.fields['role'].choices = [
            (CustomUser.Role.TECHNICIAN, 'Technician'),
            (CustomUser.Role.AMC, 'AMC'),
        ]

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'role')

class CustomerRegistrationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = CustomUser
        fields = ('name', 'email')

    def save(self, commit=True):
        user = super().save(commit=False)
        user.role = CustomUser.Role.CUSTOMER
        if commit:
            user.save()
        return user

class CustomUserCreationForm(UserCreationForm):
    class Meta:
        model = CustomUser
        fields = ("email", "name", "role")

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields['role'].choices = [
            (CustomUser.Role.TECHNICIAN, 'Technician'),
            (CustomUser.Role.AMC, 'AMC'),
        ]

class CustomUserChangeForm(UserChangeForm):
    class Meta:
        model = CustomUser
        fields = ('email', 'name', 'role')

class AddressForm(forms.ModelForm):
    class Meta:
        model = Address
        fields = ['street_address', 'city', 'state', 'pincode']