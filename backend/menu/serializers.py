from rest_framework import serializers
from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    item_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'icon', 'is_active', 'item_count', 'created_at']

    def get_item_count(self, obj):
        return obj.items.filter(is_available=True).count()

    def validate_name(self, value):
        instance = self.instance
        qs = Category.objects.filter(name__iexact=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError("A category with this name already exists.")
        return value


class MenuItemSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'image_url', 'is_available', 'is_featured',
            'preparation_time', 'calories', 'allergens', 'created_at', 'updated_at'
        ]

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image and request:
            return request.build_absolute_uri(obj.image.url)
        return None

    def validate_price(self, value):
        if value <= 0:
            raise serializers.ValidationError("Price must be greater than 0.")
        return value

    def validate_preparation_time(self, value):
        if value < 1:
            raise serializers.ValidationError("Preparation time must be at least 1 minute.")
        return value
