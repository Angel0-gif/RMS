from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated, AllowAny, BasePermission
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class IsManagerOrReadOnly(BasePermission):
    """Allow read to anyone; write only to manager/staff."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.is_authenticated and request.user.role in ['manager', 'staff']


class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class MenuItemViewSet(viewsets.ModelViewSet):
    serializer_class = MenuItemSerializer
    permission_classes = [IsManagerOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'name', 'created_at']

    def get_queryset(self):
        qs = MenuItem.objects.select_related('category')
        category = self.request.query_params.get('category')
        available = self.request.query_params.get('available')
        featured = self.request.query_params.get('featured')
        if category:
            qs = qs.filter(category_id=category)
        if available == 'true':
            qs = qs.filter(is_available=True)
        if featured == 'true':
            qs = qs.filter(is_featured=True)
        return qs

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def featured(self, request):
        items = self.get_queryset().filter(is_featured=True, is_available=True)
        serializer = self.get_serializer(items, many=True)
        return Response(serializer.data)
