from django.contrib import admin
from .models import Category, MenuItem


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'is_active', 'item_count', 'created_at']
    list_filter = ['is_active']
    search_fields = ['name']

    def item_count(self, obj):
        return obj.items.count()
    item_count.short_description = 'Items'


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'price', 'is_available', 'is_featured', 'preparation_time', 'created_at']
    list_filter = ['category', 'is_available', 'is_featured']
    search_fields = ['name', 'description']
    list_editable = ['is_available', 'is_featured', 'price']
    ordering = ['category', 'name']
