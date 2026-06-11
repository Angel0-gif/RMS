from django.contrib import admin
from .models import Table, Order, OrderItem, Reservation, Payment


@admin.register(Table)
class TableAdmin(admin.ModelAdmin):
    list_display = ['number', 'capacity', 'is_occupied', 'location']
    list_editable = ['is_occupied']
    list_filter = ['is_occupied', 'location']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['unit_price', 'subtotal']

    def subtotal(self, obj):
        return obj.subtotal


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'table', 'status', 'payment_status', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_status', 'payment_method', 'created_at']
    search_fields = ['user__email', 'user__first_name', 'user__last_name']
    readonly_fields = ['total_amount', 'created_at', 'updated_at']
    inlines = [OrderItemInline]
    ordering = ['-created_at']


@admin.register(Reservation)
class ReservationAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'table', 'date', 'time', 'party_size', 'status']
    list_filter = ['status', 'date']
    search_fields = ['user__email', 'user__first_name']
    ordering = ['-date', '-time']


@admin.register(Payment)
class PaymentAdmin(admin.ModelAdmin):
    list_display = ('reference', 'order', 'phone', 'operator', 'amount', 'status', 'created_at')
    list_filter = ('status', 'operator')
    search_fields = ('reference', 'phone', 'order__id')
    date_hierarchy = 'created_at'
