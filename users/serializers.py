# users/serializers.py
from rest_framework import serializers
from .models import CustomUser

# This is the only serializer this file needs for our current setup.
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'email', 'name', 'role']