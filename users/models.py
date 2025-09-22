# users/models.py

from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager

# ------------------------------------------------------------------
# STEP 1: CREATE THE CUSTOM MANAGER
# ------------------------------------------------------------------
class CustomUserManager(BaseUserManager):
    """
    Custom user model manager where email is the unique identifier
    for authentication instead of usernames.
    """
    def create_user(self, email, password, **extra_fields):
        """
        Create and save a User with the given email and password.
        """
        if not email:
            raise ValueError('The Email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        """
        Create and save a SuperUser with the given email and password.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('role', 'ADMIN') # Set the role to ADMIN for superusers

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self.create_user(email, password, **extra_fields)


# ------------------------------------------------------------------
# STEP 2: UPDATE THE CUSTOM USER MODEL
# ------------------------------------------------------------------
class CustomUser(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "ADMIN", "Admin"
        CUSTOMER = "CUSTOMER", "Customer"
        TECHNICIAN = "TECHNICIAN", "Technician"
        AMC = "AMC", "AMC"

    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=50, choices=Role.choices, default=Role.CUSTOMER)
    username = None

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']

    # This is the line that plugs in our custom manager
    objects = CustomUserManager()

    def __str__(self):
        return self.email