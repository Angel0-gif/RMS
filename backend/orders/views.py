from rest_framework import viewsets, filters, status
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.decorators import action
from rest_framework.response import Response
from datetime import date, timedelta
from .models import Order, Table, Reservation
from .serializers import OrderSerializer, TableSerializer, ReservationSerializer


class IsManagerOrStaff(BasePermission):
    """Only manager or staff can access."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['manager', 'staff']


class IsManagerOrStaffOrReadOnly(BasePermission):
    """Manager/staff can write; authenticated users can read tables."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.is_authenticated and request.user.role in ['manager', 'staff']


class TableViewSet(viewsets.ModelViewSet):
    """Tables: anyone can read, only manager/staff can add/edit/delete."""
    queryset = Table.objects.all().order_by('number')
    serializer_class = TableSerializer
    permission_classes = [IsManagerOrStaffOrReadOnly]


class OrderViewSet(viewsets.ModelViewSet):
    """
    - Manager/staff: see ALL orders, create orders for any table, update status, mark paid.
    - Customer: see ONLY their own orders, place new orders.
    """
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['status', 'payment_status', 'user__email', 'user__first_name']
    ordering_fields = ['created_at', 'total_amount']

    def get_queryset(self):
        user = self.request.user
        qs = Order.objects.all() if user.role in ['manager', 'staff'] else Order.objects.filter(user=user)
        qs = qs.prefetch_related('items__menu_item').select_related('user', 'table')

        # Optional filters
        status_f = self.request.query_params.get('status')
        payment_f = self.request.query_params.get('payment_status')
        date_f = self.request.query_params.get('date')
        if status_f:
            qs = qs.filter(status=status_f)
        if payment_f:
            qs = qs.filter(payment_status=payment_f)
        if date_f:
            qs = qs.filter(created_at__date=date_f)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def update_status(self, request, pk=None):
        order = self.get_object()
        new_status = request.data.get('status')
        valid = [s[0] for s in Order.STATUS_CHOICES]
        if new_status not in valid:
            return Response({'error': 'Invalid status.'}, status=status.HTTP_400_BAD_REQUEST)
        if order.status == 'cancelled':
            return Response({'error': 'Cannot update a cancelled order.'}, status=status.HTTP_400_BAD_REQUEST)
        order.status = new_status
        order.save()
        return Response(OrderSerializer(order, context={'request': request}).data)

    @action(detail=True, methods=['patch'])
    def pay(self, request, pk=None):
        order = self.get_object()
        if order.payment_status == 'paid':
            return Response({'error': 'Order is already paid.'}, status=status.HTTP_400_BAD_REQUEST)
        order.payment_status = 'paid'
        order.payment_method = request.data.get('payment_method', 'cash')
        order.save()
        return Response(OrderSerializer(order, context={'request': request}).data)

    @action(detail=False, methods=['get'])
    def summary(self, request):
        orders = self.get_queryset()
        return Response({
            'total_orders': orders.count(),
            'pending': orders.filter(status='pending').count(),
            'confirmed': orders.filter(status='confirmed').count(),
            'preparing': orders.filter(status='preparing').count(),
            'ready': orders.filter(status='ready').count(),
            'served': orders.filter(status='served').count(),
            'cancelled': orders.filter(status='cancelled').count(),
            'total_spent': float(sum(o.total_amount for o in orders.filter(payment_status='paid'))),
        })

    @action(detail=False, methods=['get'], permission_classes=[IsManagerOrStaff])
    def daily_report(self, request):
        """
        Daily report — only accessible to manager/staff.
        Returns revenue, order stats, top items, table status for a given date.
        """
        report_date_str = request.query_params.get('date', str(date.today()))
        try:
            report_date = date.fromisoformat(report_date_str)
        except ValueError:
            report_date = date.today()

        orders_today = Order.objects.filter(created_at__date=report_date)
        paid_today = orders_today.filter(payment_status='paid')
        revenue_today = float(sum(o.total_amount for o in paid_today))

        prev_date = report_date - timedelta(days=1)
        revenue_prev = float(sum(
            o.total_amount for o in Order.objects.filter(
                created_at__date=prev_date, payment_status='paid'
            )
        ))

        # Top selling items today
        item_map = {}
        for order in orders_today.prefetch_related('items__menu_item'):
            for item in order.items.all():
                name = item.menu_item.name
                if name not in item_map:
                    item_map[name] = {'name': name, 'quantity': 0, 'revenue': 0.0}
                item_map[name]['quantity'] += item.quantity
                item_map[name]['revenue'] += float(item.unit_price * item.quantity)

        top_items = sorted(item_map.values(), key=lambda x: x['quantity'], reverse=True)[:5]

        change_pct = 0.0
        if revenue_prev > 0:
            change_pct = round((revenue_today - revenue_prev) / revenue_prev * 100, 1)

        return Response({
            'date': str(report_date),
            'orders_total': orders_today.count(),
            'orders_paid': paid_today.count(),
            'orders_pending': orders_today.filter(status='pending').count(),
            'orders_cancelled': orders_today.filter(status='cancelled').count(),
            'revenue_today': revenue_today,
            'revenue_prev_day': revenue_prev,
            'revenue_change_pct': change_pct,
            'top_items': top_items,
            'reservations_today': Reservation.objects.filter(date=report_date).count(),
            'tables_occupied': Table.objects.filter(is_occupied=True).count(),
            'tables_free': Table.objects.filter(is_occupied=False).count(),
        })


class ReservationViewSet(viewsets.ModelViewSet):
    """
    - Manager/staff: see ALL reservations, create for any customer, update, delete.
    - Customer: see ONLY their own reservations.
    """
    serializer_class = ReservationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = Reservation.objects.all() if user.role in ['manager', 'staff'] else Reservation.objects.filter(user=user)
        qs = qs.select_related('table', 'user')

        date_f = self.request.query_params.get('date')
        status_f = self.request.query_params.get('status')
        if date_f:
            qs = qs.filter(date=date_f)
        if status_f:
            qs = qs.filter(status=status_f)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
