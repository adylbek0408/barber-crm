from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/', include('apps.barbershops.urls')),
    path('api/', include('apps.barbers.urls')),
    path('api/', include('apps.appointments.urls')),
    path('api/', include('apps.analytics.urls')),
]
