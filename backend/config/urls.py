from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Restaurant MS Admin"
admin.site.site_title = "Restaurant Management System"
admin.site.index_title = "Welcome to Restaurant Admin"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/orders/', include('orders.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
