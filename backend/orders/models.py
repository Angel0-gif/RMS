from django.db import models
from django.conf import settings
from menu.models import MenuItem


class Table(models.Model):
    number = models.PositiveIntegerField(unique=True)
    capacity = models.PositiveIntegerField(default=4)
    is_occupied = models.BooleanField(default=False)
    location = models.CharField(max_length=50, blank=True, help_text="e.g. Window, Terrace, VIP")

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"Table {self.number} (capacity: {self.capacity})"


class Order(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('preparing', 'Preparing'),
        ('ready', 'Ready'),
        ('served', 'Served'),
        ('cancelled', 'Cancelled'),
    ]
    PAYMENT_STATUS_CHOICES = [
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
    ]
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Cash'),
        ('card', 'Card'),
        ('mobile_money', 'Mobile Money'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='orders')
    table = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True, related_name='orders')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='unpaid')
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, blank=True)
    notes = models.TextField(blank=True, help_text="Special instructions")
    total_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.id} by {self.user.full_name} — {self.status}"

    def calculate_total(self):
        total = sum(item.subtotal for item in self.items.all())
        self.total_amount = total
        self.save(update_fields=['total_amount'])
        return total


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT, related_name='order_items')
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    special_request = models.CharField(max_length=255, blank=True)

    class Meta:
        unique_together = ['order', 'menu_item']

    def __str__(self):
        return f"{self.quantity}x {self.menu_item.name} in Order #{self.order.id}"

    @property
    def subtotal(self):
        return self.unit_price * self.quantity

    def save(self, *args, **kwargs):
        if not self.unit_price:
            self.unit_price = self.menu_item.price
        super().save(*args, **kwargs)


class Reservation(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reservations')
    table = models.ForeignKey(Table, on_delete=models.CASCADE, related_name='reservations')
    date = models.DateField()
    time = models.TimeField()
    party_size = models.PositiveIntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-time']

    def __str__(self):
        return f"Reservation by {self.user.full_name} on {self.date} at {self.time}"
