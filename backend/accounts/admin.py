from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['email', 'username', 'full_name', 'role', 'phone', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'is_staff', 'created_at']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone']
    ordering = ['-created_at']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = UserAdmin.fieldsets + (
        ('Profile Info', {'fields': ('phone', 'role', 'avatar', 'bio', 'address', 'date_of_birth')}),
        ('Timestamps', {'fields': ('created_at', 'updated_at')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Profile Info', {'fields': ('email', 'first_name', 'last_name', 'phone', 'role')}),
    )
