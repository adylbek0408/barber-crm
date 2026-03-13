from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BarberAppointmentViewSet, OwnerAppointmentViewSet, ShopAdminAppointmentViewSet

router = DefaultRouter()
router.register('barber/appointments', BarberAppointmentViewSet, basename='barber-appointments')
router.register('owner/appointments', OwnerAppointmentViewSet, basename='owner-appointments')
router.register('shop-admin/appointments', ShopAdminAppointmentViewSet, basename='shop-admin-appointments')

urlpatterns = [
    path('', include(router.urls)),
]
