from rest_framework import serializers
from .models import Order, OrderItem, Table, Reservation
from menu.models import MenuItem
from menu.serializers import MenuItemSerializer


class TableSerializer(serializers.ModelSerializer):
    class Meta:
        model = Table
        fields = ['id', 'number', 'capacity', 'is_occupied', 'location']


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_detail = MenuItemSerializer(source='menu_item', read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = OrderItem
        fields = ['id', 'menu_item', 'menu_item_detail', 'quantity', 'unit_price', 'special_request', 'subtotal']
        read_only_fields = ['unit_price']

    def validate_quantity(self, value):
        if value < 1:
            raise serializers.ValidationError("Quantity must be at least 1.")
        if value > 50:
            raise serializers.ValidationError("Cannot order more than 50 of one item.")
        return value

    def validate_menu_item(self, value):
        if not value.is_available:
            raise serializers.ValidationError(f"'{value.name}' is currently not available.")
        return value


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    table_number = serializers.IntegerField(source='table.number', read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'user_name', 'table', 'table_number',
            'status', 'payment_status', 'payment_method',
            'notes', 'total_amount', 'items', 'created_at', 'updated_at'
        ]
        read_only_fields = ['user', 'total_amount', 'created_at', 'updated_at']

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError("An order must contain at least one item.")
        return value

    def validate(self, attrs):
        # Can only cancel a served/paid order with permission
        return attrs

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        order = Order.objects.create(**validated_data)
        for item_data in items_data:
            menu_item = item_data['menu_item']
            OrderItem.objects.create(
                order=order,
                menu_item=menu_item,
                quantity=item_data['quantity'],
                unit_price=menu_item.price,
                special_request=item_data.get('special_request', '')
            )
        order.calculate_total()
        return order

    def update(self, instance, validated_data):
        items_data = validated_data.pop('items', None)
        # Only allow status updates if order is not cancelled/served
        if instance.status in ['cancelled', 'served'] and 'status' not in validated_data:
            raise serializers.ValidationError("Cannot update a completed or cancelled order.")
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if items_data is not None:
            instance.items.all().delete()
            for item_data in items_data:
                menu_item = item_data['menu_item']
                OrderItem.objects.create(
                    order=instance,
                    menu_item=menu_item,
                    quantity=item_data['quantity'],
                    unit_price=menu_item.price,
                    special_request=item_data.get('special_request', '')
                )
            instance.calculate_total()
        return instance


class ReservationSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.full_name', read_only=True)
    table_detail = TableSerializer(source='table', read_only=True)

    class Meta:
        model = Reservation
        fields = [
            'id', 'user', 'user_name', 'table', 'table_detail',
            'date', 'time', 'party_size', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['user', 'created_at']

    def validate(self, attrs):
        table = attrs.get('table', getattr(self.instance, 'table', None))
        party_size = attrs.get('party_size', getattr(self.instance, 'party_size', None))
        date = attrs.get('date')
        time = attrs.get('time')

        if table and party_size and party_size > table.capacity:
            raise serializers.ValidationError({
                "party_size": f"Party size ({party_size}) exceeds table capacity ({table.capacity})."
            })

        # Check for conflicting reservations (2-hour window)
        if table and date and time:
            from datetime import datetime, timedelta
            dt = datetime.combine(date, time)
            start = (dt - timedelta(hours=2)).time()
            end = (dt + timedelta(hours=2)).time()
            qs = Reservation.objects.filter(
                table=table,
                date=date,
                status__in=['pending', 'confirmed'],
                time__range=(start, end)
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({
                    "table": "This table is already reserved for that time slot."
                })
        return attrs
