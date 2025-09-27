# users/admin.py - Fixed version

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.forms import AdminPasswordChangeForm
from .forms import CustomUserCreationForm, CustomUserChangeForm
from .models import CustomUser

class CustomUserAdmin(UserAdmin):
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    change_password_form = AdminPasswordChangeForm
    model = CustomUser
    list_display = ['email', 'name', 'role', 'is_staff', 'is_active', 'date_joined']
    list_filter = ['role', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['email', 'name']
    ordering = ('email',)

    # Fieldsets for editing existing user
    fieldsets = (
        (None, {"fields": ("email", "name")}),
        ("Personal info", {"fields": ("phone", "role")}),
        ("Notifications", {"fields": ("email_notifications", "sms_notifications")}),
        (
            "Permissions",
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        ("Important dates", {"fields": ("last_login", "date_joined")}),
    )

    # Fieldsets for adding new user
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "name", "phone", "role", "password1", "password2"),
            },
        ),
    )

    # Read-only fields
    readonly_fields = ('date_joined', 'last_login')

    # Custom methods for better display
    def get_form(self, request, obj=None, **kwargs):
        """
        Use special form during user creation
        """
        defaults = {}
        if obj is None:
            defaults['form'] = self.add_form
        defaults.update(kwargs)
        return super().get_form(request, obj, **defaults)

admin.site.register(CustomUser, CustomUserAdmin)